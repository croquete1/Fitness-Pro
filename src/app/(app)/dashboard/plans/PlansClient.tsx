'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import type {
  PlanInsight,
  PlanStatusKey,
  PlanTimelinePoint,
  PlanTrainerStat,
  PlansDashboardData,
} from '@/lib/plans/types';

const STATUS_META: Record<PlanStatusKey, { label: string; tone: 'ok' | 'warn' | 'down' | 'neutral' }> = {
  active: { label: 'Ativo', tone: 'ok' },
  draft: { label: 'Rascunho', tone: 'warn' },
  archived: { label: 'Arquivado', tone: 'neutral' },
  deleted: { label: 'Removido', tone: 'down' },
  unknown: { label: 'Desconhecido', tone: 'warn' },
};

const rangeOptions: Array<{ label: string; value: '6' | '12' | '24' }> = [
  { label: '6 semanas', value: '6' },
  { label: '12 semanas', value: '12' },
  { label: '24 semanas', value: '24' },
];

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível sincronizar os planos.');
  }
  const payload = (await response.json()) as PlansDashboardData & {
    ok: boolean;
    source: 'supabase' | 'fallback';
    message?: string;
  };
  if (!payload?.ok) {
    throw new Error(payload?.message || 'Não foi possível carregar os planos.');
  }
  return payload;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function normaliseStatus(value: string | null | undefined): PlanStatusKey {
  if (!value) return 'unknown';
  const status = value.toString().trim().toUpperCase();
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'LIVE':
      return 'active';
    case 'ARCHIVED':
    case 'COMPLETED':
    case 'FINISHED':
      return 'archived';
    case 'DELETED':
    case 'CANCELLED':
      return 'deleted';
    case 'DRAFT':
    case 'WAITING':
    case 'PENDING':
    case 'PAUSED':
      return 'draft';
    default:
      return 'unknown';
  }
}

function formatDate(iso: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', options ?? { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatTimeAgo(iso: string | null | undefined) {
  const date = parseDate(iso);
  if (!date) return '—';
  const diffDays = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000);
  if (diffDays <= 0) return 'hoje';
  if (diffDays === 1) return 'há 1 dia';
  return `há ${diffDays} dias`;
}

function formatTrainer(trainer: PlanTrainerStat) {
  if (trainer.trainerName) return trainer.trainerName;
  if (trainer.trainerEmail) return trainer.trainerEmail;
  return 'Sem treinador associado';
}

function describeStatus(value: string | null | undefined) {
  const key = normaliseStatus(value);
  const meta = STATUS_META[key];
  return { key, label: meta.label, tone: meta.tone };
}

function toChartPoint(point: PlanTimelinePoint) {
  return {
    name: point.label,
    created: point.created,
    updated: point.updated,
    archived: point.archived,
  };
}

type PlansClientProps = {
  initialData: PlansDashboardData;
};

export default function PlansClient({ initialData }: PlansClientProps) {
  const [data, setData] = React.useState(initialData);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<'all' | PlanStatusKey>('all');
  const [trainer, setTrainer] = React.useState<'all' | string>('all');
  const [range, setRange] = React.useState<'6' | '12' | '24'>('12');

  const { data: remoteData, error, isLoading } = useSWR('/api/client/plans/dashboard', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });

  React.useEffect(() => {
    if (remoteData) {
      setData(remoteData);
    }
  }, [remoteData]);

  const timelineRange = React.useMemo(() => {
    const weeks = parseInt(range, 10);
    const { timeline } = data;
    if (!Array.isArray(timeline)) return [];
    return timeline.slice(Math.max(0, timeline.length - weeks)).map(toChartPoint);
  }, [data, range]);

  const trainerOptions = React.useMemo(() => {
    const options = data.trainers
      .filter((item) => item.trainerId)
      .map((item) => ({ value: item.trainerId, label: formatTrainer(item) }));
    const unique = new Map<string, string>();
    options.forEach((option) => {
      if (!unique.has(option.value)) {
        unique.set(option.value, option.label);
      }
    });
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [data.trainers]);

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.rows.filter((row) => {
      const statusKey = normaliseStatus(row.status);
      if (status !== 'all' && statusKey !== status) return false;
      if (trainer !== 'all' && row.trainerId !== trainer) return false;
      if (!q) return true;
      const haystack = [
        row.title?.toLowerCase() ?? '',
        row.trainerName?.toLowerCase() ?? '',
        row.trainerEmail?.toLowerCase() ?? '',
        STATUS_META[statusKey].label.toLowerCase(),
      ];
      return haystack.some((field) => field.includes(q));
    });
  }, [data.rows, query, status, trainer]);

  const emptyStateTitle = data.rows.length > 0 ? 'Sem resultados' : 'Ainda sem planos';
  const emptyStateDescription = data.rows.length > 0
    ? 'Ajusta os filtros ou limpa a pesquisa para voltares a ver a lista completa.'
    : 'Assim que o teu PT publicar um plano vais recebê-lo automaticamente aqui.';

  const lastUpdated = formatDate(data.updatedAt, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fallbackActive = data.fallback || remoteData?.source === 'fallback';

  return (
    <div className="plans-dashboard">
      <PageHeader
        title="Planos de treino"
        subtitle="Analisa a evolução dos teus planos, acompanha as atualizações do teu PT e prepara os próximos arranques no tema Neo."
      />

      <section className="neo-panel plans-dashboard__hero" aria-labelledby="plans-hero-heading">
        <header className="plans-dashboard__heroHeader">
          <div>
            <h2 id="plans-hero-heading" className="neo-panel__title">Visão geral</h2>
            <p className="neo-panel__subtitle">
              Última sincronização {lastUpdated}
              {fallbackActive && (
                <span className="plans-dashboard__fallback" role="status">
                  Dados simulados
                </span>
              )}
            </p>
          </div>
          <div className="plans-dashboard__heroMeta" role="status" aria-live="polite">
            {isLoading && <span className="plans-dashboard__sync">A sincronizar…</span>}
            {error && <span className="plans-dashboard__error">Falha ao atualizar: {error.message}</span>}
          </div>
        </header>

        <div className="plans-dashboard__heroGrid">
          {data.hero.map((metric) => (
            <article key={metric.key} className={`plans-dashboard__heroCard plans-dashboard__heroCard--${metric.tone ?? 'neutral'}`}>
              <header className="plans-dashboard__heroCardHeader">
                <p className="plans-dashboard__heroLabel">{metric.label}</p>
                {metric.hint && <span className="plans-dashboard__heroHint">{metric.hint}</span>}
              </header>
              <p className="plans-dashboard__heroValue">{metric.value}</p>
              {metric.trend && <p className="plans-dashboard__heroTrend">{metric.trend}</p>}
            </article>
          ))}
        </div>
      </section>

      <div className="plans-dashboard__layout">
        <section className="neo-panel plans-dashboard__timeline" aria-labelledby="plans-timeline-heading">
          <header className="plans-dashboard__sectionHeader">
            <div>
              <h2 id="plans-timeline-heading" className="neo-panel__title">Atualizações semanais</h2>
              <p className="neo-panel__subtitle">Cria um histórico fiável das publicações, revisões e arquivamentos.</p>
            </div>
            <div className="plans-dashboard__filters">
              <label className="neo-input-group plans-dashboard__range">
                <span className="neo-input-group__label">Intervalo</span>
                <select
                  className="neo-input neo-input--compact"
                  value={range}
                  onChange={(event) => setRange(event.target.value as typeof range)}
                >
                  {rangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>

          <div className="plans-dashboard__chart" role="img" aria-label="Gráfico de atualizações aos planos nas últimas semanas">
            {timelineRange.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={timelineRange} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="planCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#58b6ff" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#58b6ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="planUpdated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="planArchived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F87171" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neo-chart-grid)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--neo-chart-axis)' }} tickLine={false} interval={timelineRange.length > 12 ? 1 : 0} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--neo-chart-axis)' }} tickLine={false} width={32} />
                  <Tooltip
                    cursor={{ fill: 'var(--neo-chart-cursor)' }}
                    formatter={(value: number, key: string) => {
                      const labels: Record<string, string> = {
                        created: 'Publicações',
                        updated: 'Atualizações',
                        archived: 'Arquivados',
                      };
                      return [value, labels[key] ?? key];
                    }}
                  />
                  <Area type="monotone" dataKey="updated" stroke="#7C3AED" fill="url(#planUpdated)" strokeWidth={2} name="Atualizações" />
                  <Area type="monotone" dataKey="created" stroke="#38BDF8" fill="url(#planCreated)" strokeWidth={2} name="Publicações" />
                  <Area type="monotone" dataKey="archived" stroke="#F87171" fill="url(#planArchived)" strokeWidth={2} name="Arquivados" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="neo-empty plans-dashboard__emptyChart">
                <span className="neo-empty__icon" aria-hidden>
                  📉
                </span>
                <p className="neo-empty__title">Sem dados suficientes</p>
                <p className="neo-empty__description">Quando existirem planos com histórico mostramos a tendência aqui.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="plans-dashboard__aside">
          <section className="neo-panel plans-dashboard__status" aria-labelledby="plans-status-heading">
            <header className="plans-dashboard__sectionHeader">
              <div>
                <h2 id="plans-status-heading" className="neo-panel__title">Estado dos planos</h2>
                <p className="neo-panel__subtitle">Acompanha a distribuição por estado para priorizar ações.</p>
              </div>
            </header>
            <ul className="plans-dashboard__statusList">
              {data.statuses.map((item) => (
                <li key={item.key} className={`plans-dashboard__statusItem plans-dashboard__statusItem--${item.tone}`}>
                  <div className="plans-dashboard__statusHeader">
                    <span className="plans-dashboard__statusLabel">{item.label}</span>
                    <span className="plans-dashboard__statusValue">{item.count}</span>
                  </div>
                  <div className="plans-dashboard__statusProgress" role="progressbar" aria-valuenow={item.percentage} aria-valuemin={0} aria-valuemax={100}>
                    <div style={{ width: `${item.percentage}%` }} />
                  </div>
                  <span className="plans-dashboard__statusPercentage">{item.percentage}%</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="neo-panel plans-dashboard__insights" aria-labelledby="plans-insights-heading">
            <header className="plans-dashboard__sectionHeader">
              <div>
                <h2 id="plans-insights-heading" className="neo-panel__title">Insights rápidos</h2>
                <p className="neo-panel__subtitle">Recomendações geradas automaticamente a partir dos teus planos.</p>
              </div>
            </header>
            <ul className="plans-dashboard__insightList">
              {data.insights.map((insight: PlanInsight) => (
                <li key={insight.id} className={`plans-dashboard__insight plans-dashboard__insight--${insight.tone}`}>
                  <h3 className="plans-dashboard__insightTitle">{insight.title}</h3>
                  <p className="plans-dashboard__insightDescription">{insight.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="neo-panel plans-dashboard__trainers" aria-labelledby="plans-trainers-heading">
            <header className="plans-dashboard__sectionHeader">
              <div>
                <h2 id="plans-trainers-heading" className="neo-panel__title">PT responsáveis</h2>
                <p className="neo-panel__subtitle">Dá feedback aos PT com mais planos ativos.</p>
              </div>
            </header>
            <ol className="plans-dashboard__trainerList">
              {data.trainers.map((item: PlanTrainerStat) => (
                <li key={item.trainerId} className="plans-dashboard__trainer">
                  <div className="plans-dashboard__trainerInfo">
                    <span className="plans-dashboard__trainerName">{formatTrainer(item)}</span>
                    {item.trainerEmail && <span className="plans-dashboard__trainerEmail">{item.trainerEmail}</span>}
                  </div>
                  <div className="plans-dashboard__trainerStats">
                    <span className="plans-dashboard__trainerActive">{item.active} ativos</span>
                    <span className="plans-dashboard__trainerTotal">{item.total} no total</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <section className="neo-panel plans-dashboard__table" aria-labelledby="plans-table-heading">
        <header className="plans-dashboard__sectionHeader plans-dashboard__tableHeader">
          <div>
            <h2 id="plans-table-heading" className="neo-panel__title">Lista de planos</h2>
            <p className="neo-panel__subtitle">Filtra por estado, treinador ou pesquisa para encontrar rapidamente o plano certo.</p>
          </div>
          <div className="plans-dashboard__tableFilters">
            <label className="neo-input-group plans-dashboard__filter">
              <span className="neo-input-group__label">Pesquisa</span>
              <input
                type="search"
                className="neo-input neo-input--compact"
                placeholder="Procurar por nome ou PT"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="neo-input-group plans-dashboard__filter">
              <span className="neo-input-group__label">Estado</span>
              <select
                className="neo-input neo-input--compact"
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="draft">Rascunhos</option>
                <option value="archived">Arquivados</option>
                <option value="deleted">Removidos</option>
              </select>
            </label>
            <label className="neo-input-group plans-dashboard__filter">
              <span className="neo-input-group__label">Personal trainer</span>
              <select
                className="neo-input neo-input--compact"
                value={trainer}
                onChange={(event) => setTrainer(event.target.value as typeof trainer)}
              >
                <option value="all">Todos</option>
                {trainerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table plans-dashboard__dataTable">
            <thead>
              <tr>
                <th scope="col">Plano</th>
                <th scope="col" className="plans-dashboard__stateColumn">
                  Estado
                </th>
                <th scope="col">Personal trainer</th>
                <th scope="col">Início</th>
                <th scope="col">Fim</th>
                <th scope="col">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const descriptor = describeStatus(row.status);
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="plans-dashboard__planTitle">
                        <span className="plans-dashboard__planName">{row.title}</span>
                        <span className="plans-dashboard__planMeta">Criado {formatDate(row.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill" data-state={descriptor.tone}>
                        {descriptor.label}
                      </span>
                    </td>
                    <td>
                      <div className="plans-dashboard__trainerCell">
                        <span>{row.trainerName || row.trainerEmail || 'Sem PT'}</span>
                        {row.trainerEmail && row.trainerName && (
                          <span className="plans-dashboard__trainerCellEmail">{row.trainerEmail}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <time dateTime={row.startDate ?? undefined} className="plans-dashboard__date">
                        {formatDate(row.startDate)}
                      </time>
                    </td>
                    <td>
                      <time dateTime={row.endDate ?? undefined} className="plans-dashboard__date">
                        {formatDate(row.endDate)}
                      </time>
                    </td>
                    <td>
                      <time dateTime={row.updatedAt ?? undefined} className="plans-dashboard__updated">
                        {formatTimeAgo(row.updatedAt)}
                      </time>
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-empty plans-dashboard__empty">
                      <span className="neo-empty__icon" aria-hidden>
                        📄
                      </span>
                      <p className="neo-empty__title">{emptyStateTitle}</p>
                      <p className="neo-empty__description">{emptyStateDescription}</p>
                      {(query || status !== 'all' || trainer !== 'all') && (
                        <button
                          type="button"
                          className="btn link plans-dashboard__reset"
                          onClick={() => {
                            setQuery('');
                            setStatus('all');
                            setTrainer('all');
                          }}
                        >
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
