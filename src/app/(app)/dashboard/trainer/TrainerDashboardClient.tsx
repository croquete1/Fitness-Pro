'use client';

import * as React from 'react';
import useSWR from 'swr';
import { Download } from 'lucide-react';
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
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import type {
  TrainerDashboardResponse,
  TrainerHeroMetric,
  TrainerTimelinePoint,
  TrainerHighlight,
  TrainerAgendaSession,
  TrainerUpcomingSession,
  TrainerClientSnapshot,
  TrainerApprovalItem,
} from '@/lib/trainer/dashboard/types';

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível actualizar o dashboard.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível actualizar o dashboard.');
  }
  return payload as DashboardResponse;
};

type DashboardResponse = TrainerDashboardResponse & { ok: true };

type Props = {
  initialData: DashboardResponse;
  viewerName: string | null;
};

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const percentageFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

type ClientToneFilter = 'all' | TrainerClientSnapshot['tone'];

type ClientSort = 'priority' | 'activity';

const CLIENT_TONE_FILTERS: Array<{ id: ClientToneFilter; label: string; tone: TrainerClientSnapshot['tone'] | null }> = [
  { id: 'all', label: 'Todos', tone: null },
  { id: 'positive', label: 'Em progresso', tone: 'positive' },
  { id: 'warning', label: 'Atenção', tone: 'warning' },
  { id: 'critical', label: 'Risco', tone: 'critical' },
  { id: 'neutral', label: 'Sem alerta', tone: 'neutral' },
];

const CLIENT_SORT_OPTIONS: Array<{ id: ClientSort; label: string; description: string }> = [
  { id: 'priority', label: 'Prioridade', description: 'Crítico, atenção, progresso e neutros.' },
  { id: 'activity', label: 'Maior actividade', description: 'Mais sessões futuras e concluídas.' },
];

const CLIENT_TONE_LABELS: Record<TrainerClientSnapshot['tone'], string> = {
  positive: 'Em progresso',
  warning: 'Atenção',
  critical: 'Risco',
  neutral: 'Sem alerta',
};

const HERO_TONE_CLASS: Record<TrainerHeroMetric['tone'], 'positive' | 'warning' | 'critical' | 'neutral'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
  neutral: 'neutral',
};

const HIGHLIGHT_TONE_CLASS: Record<TrainerHighlight['tone'], 'positive' | 'warning' | 'critical' | 'info'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
  info: 'info',
};

const SESSION_TONE_CLASS: Record<'positive' | 'warning' | 'critical', 'positive' | 'warning' | 'critical'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
};

const CLIENT_TONE_CLASS: Record<TrainerClientSnapshot['tone'], 'positive' | 'warning' | 'critical' | 'neutral'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
  neutral: 'neutral',
};

const APPROVAL_TONE_CLASS: Record<TrainerApprovalItem['tone'], 'positive' | 'warning' | 'critical' | 'neutral'> = {
  positive: 'positive',
  warning: 'warning',
  critical: 'critical',
  neutral: 'neutral',
};

const CLIENT_FILTER_STORAGE_KEY = 'trainer-dashboard:client-preferences';

const TONE_PRIORITY: Record<TrainerClientSnapshot['tone'], number> = {
  critical: 0,
  warning: 1,
  positive: 2,
  neutral: 3,
};

type ClientToneFilter = 'all' | TrainerClientSnapshot['tone'];

const CLIENT_TONE_FILTERS: Array<{ id: ClientToneFilter; label: string; tone: TrainerClientSnapshot['tone'] | null }> = [
  { id: 'all', label: 'Todos', tone: null },
  { id: 'positive', label: 'Em progresso', tone: 'positive' },
  { id: 'warning', label: 'Atenção', tone: 'warning' },
  { id: 'critical', label: 'Risco', tone: 'critical' },
  { id: 'neutral', label: 'Sem alerta', tone: 'neutral' },
];

const TONE_PRIORITY: Record<TrainerClientSnapshot['tone'], number> = {
  critical: 0,
  warning: 1,
  positive: 2,
  neutral: 3,
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-PT');
}

function firstName(fullName: string | null): string {
  if (!fullName) return 'Treinador';
  const [first] = fullName.split(/\s+/);
  return first || fullName;
}

const nameCollator = new Intl.Collator('pt-PT', { sensitivity: 'base' });

function heroToneClass(metric: TrainerHeroMetric) {
  return HERO_TONE_CLASS[metric.tone] ?? 'neutral';
}

function highlightToneClass(highlight: TrainerHighlight) {
  return HIGHLIGHT_TONE_CLASS[highlight.tone] ?? 'info';
}

function sessionToneClass(tone: TrainerUpcomingSession['tone'] | TrainerAgendaSession['tone']) {
  return SESSION_TONE_CLASS[tone] ?? 'warning';
}

function clientToneClass(tone: TrainerClientSnapshot['tone']) {
  return CLIENT_TONE_CLASS[tone] ?? 'neutral';
}

function approvalToneClass(tone: TrainerApprovalItem['tone']) {
  return APPROVAL_TONE_CLASS[tone] ?? 'neutral';
}

function TimelineTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as TrainerTimelinePoint | undefined;
  if (!point) return null;
  return (
    <div className="trainer-dashboard__tooltip">
      <div className="trainer-dashboard__tooltip-label">{point.label}</div>
      <div className="trainer-dashboard__tooltip-row">
        <span>Agendadas</span>
        <strong>{numberFormatter.format(point.scheduled)}</strong>
      </div>
      <div className="trainer-dashboard__tooltip-row">
        <span>Concluídas</span>
        <strong>{numberFormatter.format(point.completed)}</strong>
      </div>
      <div className="trainer-dashboard__tooltip-row">
        <span>Canceladas</span>
        <strong>{numberFormatter.format(point.cancelled)}</strong>
      </div>
    </div>
  );
}

export default function TrainerDashboardClient({ initialData, viewerName }: Props) {
  const { data, error, isValidating, mutate } = useSWR<DashboardResponse>('/api/trainer/dashboard', fetcher, {
    fallbackData: initialData,
    revalidateOnMount: true,
  });

  const dashboard = data ?? initialData;

  const greeting = React.useMemo(() => firstName(viewerName ?? dashboard.trainerName), [viewerName, dashboard.trainerName]);

  const [clientQuery, setClientQuery] = React.useState('');
  const [clientToneFilter, setClientToneFilter] = React.useState<ClientToneFilter>('all');
  const [clientSort, setClientSort] = React.useState<ClientSort>('priority');
  const filtersHydratedRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(CLIENT_FILTER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{ query: unknown; tone: unknown; sort: unknown }> | null;
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.query === 'string') {
          setClientQuery(parsed.query);
        }
        if (
          typeof parsed.tone === 'string' &&
          CLIENT_TONE_FILTERS.some((filter) => filter.id === parsed.tone)
        ) {
          setClientToneFilter(parsed.tone as ClientToneFilter);
        }
        if (
          typeof parsed.sort === 'string' &&
          CLIENT_SORT_OPTIONS.some((option) => option.id === parsed.sort)
        ) {
          setClientSort(parsed.sort as ClientSort);
        }
      }
    } catch (storageError) {
      // Ignora estados inválidos armazenados.
    } finally {
      filtersHydratedRef.current = true;
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !filtersHydratedRef.current) return;
    const payload = JSON.stringify({ query: clientQuery, tone: clientToneFilter, sort: clientSort });
    window.localStorage.setItem(CLIENT_FILTER_STORAGE_KEY, payload);
  }, [clientQuery, clientToneFilter, clientSort]);

  const normalizedQuery = React.useMemo(() => clientQuery.trim().toLowerCase(), [clientQuery]);
  const hasFilters = normalizedQuery.length > 0 || clientToneFilter !== 'all' || clientSort !== 'priority';

  const clearFilters = React.useCallback(() => {
    setClientQuery('');
    setClientToneFilter('all');
    setClientSort('priority');
  }, []);

  const filteredClients = React.useMemo(() => {
    const normalizedClients = dashboard.clients
      .filter((client) => {
        const matchesQuery = normalizedQuery.length === 0
          ? true
          : [client.name, client.email ?? '', client.lastSessionLabel, client.nextSessionLabel]
              .join(' ')
              .toLowerCase()
              .includes(normalizedQuery);
        const matchesTone = clientToneFilter === 'all' ? true : client.tone === clientToneFilter;
        return matchesQuery && matchesTone;
      });

    return normalizedClients.sort((a, b) => {
      if (clientSort === 'activity') {
        const upcomingDiff = b.upcoming - a.upcoming;
        if (upcomingDiff !== 0) return upcomingDiff;
        const completedDiff = b.completed - a.completed;
        if (completedDiff !== 0) return completedDiff;
      } else {
        const toneDiff = (TONE_PRIORITY[a.tone] ?? 99) - (TONE_PRIORITY[b.tone] ?? 99);
        if (toneDiff !== 0) return toneDiff;
      }

      return nameCollator.compare(a.name, b.name);
    });
  }, [dashboard.clients, normalizedQuery, clientToneFilter, clientSort]);

  const clientStats = React.useMemo(() => {
    const totals = filteredClients.reduce(
      (acc, client) => {
        acc.upcoming += client.upcoming;
        acc.completed += client.completed;
        if (client.tone === 'critical' || client.tone === 'warning') {
          acc.attention += 1;
        }
        return acc;
      },
      { total: filteredClients.length, upcoming: 0, completed: 0, attention: 0 },
    );

    const attentionRate = totals.total === 0 ? 0 : totals.attention / totals.total;

    return {
      ...totals,
      totalLabel: numberFormatter.format(totals.total),
      upcomingLabel: numberFormatter.format(totals.upcoming),
      completedLabel: numberFormatter.format(totals.completed),
      attentionLabel: numberFormatter.format(totals.attention),
      attentionRateLabel: percentageFormatter.format(attentionRate),
    };
  }, [filteredClients]);

  const handleRefresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  const exportClients = React.useCallback(() => {
    if (filteredClients.length === 0) return;

    const header = ['Cliente', 'Email', 'Próximas', 'Concluídas', 'Última sessão', 'Próxima sessão', 'Prioridade'];
    const rows = filteredClients.map((client) => [
      client.name,
      client.email ?? '',
      String(client.upcoming),
      String(client.completed),
      client.lastSessionLabel,
      client.nextSessionLabel,
      CLIENT_TONE_LABELS[client.tone] ?? client.tone,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carteira-clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredClients]);

  return (
    <div className="trainer-dashboard">
      <PageHeader
        title={`Olá, ${greeting}`}
        subtitle="Acompanha métricas, pedidos e sessões do teu portefólio."
        sticky={false}
        actions={
          <div className="trainer-dashboard__actions">
            <DataSourceBadge
              source={dashboard.source}
              generatedAt={dashboard.updatedAt}
              className="trainer-dashboard__data-source"
            />
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={isValidating}
              aria-busy={isValidating}
            >
              {isValidating ? 'A actualizar…' : 'Actualizar'}
            </Button>
          </div>
        }
      />

      {error && (
        <Alert tone="danger" className="trainer-dashboard__alert" title="Sincronização falhou">
          {error.message || 'Não foi possível ligar ao Supabase. A mostrar dados locais.'}
        </Alert>
      )}

      <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-hero">
        <div className="neo-panel__header trainer-dashboard__panel-header">
          <div className="neo-panel__meta">
            <h2 id="trainer-dashboard-hero" className="neo-panel__title">
              Indicadores-chave
            </h2>
            <p className="neo-panel__subtitle">Última actualização: {formatUpdatedAt(dashboard.updatedAt)}</p>
          </div>
        </div>
        <div className="trainer-dashboard__hero-grid">
          {dashboard.hero.map((metric) => (
            <article
              key={metric.id}
              className={`trainer-dashboard__hero-card trainer-dashboard__hero-card--${heroToneClass(metric)}`}
            >
              <div className="trainer-dashboard__hero-meta">
                <span className="trainer-dashboard__hero-label">{metric.label}</span>
                <span className="trainer-dashboard__hero-value">{metric.value}</span>
              </div>
              {metric.hint && <p className="trainer-dashboard__hero-hint">{metric.hint}</p>}
              {metric.trend && <span className="trainer-dashboard__hero-trend">{metric.trend}</span>}
            </article>
          ))}
        </div>
      </section>

      <div className="trainer-dashboard__grid">
        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-timeline">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-timeline" className="neo-panel__title">
                Actividade das últimas semanas
              </h2>
              <p className="neo-panel__subtitle">Sessões agendadas, concluídas e canceladas (14 dias).</p>
            </div>
          </div>
          <div className="trainer-dashboard__chart">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dashboard.timeline}>
                <CartesianGrid strokeDasharray="4 4" className="trainer-dashboard__chart-grid" />
                <XAxis dataKey="label" stroke="currentColor" className="trainer-dashboard__chart-axis" />
                <YAxis stroke="currentColor" className="trainer-dashboard__chart-axis" allowDecimals={false} />
                <Tooltip content={<TimelineTooltip />} cursor={{ stroke: 'var(--neo-border-strong)' }} />
                <Area type="monotone" dataKey="scheduled" stackId="1" stroke="var(--neo-chart-primary)" fill="var(--neo-chart-primary-fill)" />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="var(--neo-chart-positive)" fill="var(--neo-chart-positive-fill)" />
                <Area type="monotone" dataKey="cancelled" stackId="1" stroke="var(--neo-chart-warning)" fill="var(--neo-chart-warning-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-highlights">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-highlights" className="neo-panel__title">
                Destaques imediatos
              </h2>
              <p className="neo-panel__subtitle">O que merece atenção nas próximas horas.</p>
            </div>
          </div>
          <ul className="trainer-dashboard__highlights">
            {dashboard.highlights.map((highlight) => (
              <li
                key={highlight.id}
                className={`trainer-dashboard__highlight trainer-dashboard__highlight--${highlightToneClass(highlight)}`}
              >
                <h3 className="trainer-dashboard__highlight-title">{highlight.title}</h3>
                <p className="trainer-dashboard__highlight-description">{highlight.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="trainer-dashboard__grid">
        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-agenda">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-agenda" className="neo-panel__title">
                Agenda (próximos 7 dias)
              </h2>
              <p className="neo-panel__subtitle">Resumo diário das sessões planeadas.</p>
            </div>
          </div>
          <div className="trainer-dashboard__agenda-grid">
            {dashboard.agenda.map((day) => (
              <article key={day.date} className="trainer-dashboard__agenda-day">
                <header className="trainer-dashboard__agenda-header">
                  <span className="trainer-dashboard__agenda-label">{day.label}</span>
                  <span className="trainer-dashboard__agenda-count">{day.total} sessão(ões)</span>
                </header>
                <ul className="trainer-dashboard__agenda-list">
                  {day.sessions.length === 0 ? (
                    <li className="trainer-dashboard__agenda-empty">Sem sessões.</li>
                  ) : (
                    day.sessions.map((session) => (
                      <li
                        key={session.id}
                        className={`trainer-dashboard__agenda-item trainer-dashboard__agenda-item--${sessionToneClass(session.tone)}`}
                      >
                        <span className="trainer-dashboard__agenda-time">{session.timeLabel}</span>
                        <div className="trainer-dashboard__agenda-meta">
                          <span className="trainer-dashboard__agenda-client">{session.clientName}</span>
                          <span className="trainer-dashboard__agenda-status">{session.status}</span>
                        </div>
                        <span className="trainer-dashboard__agenda-location">{session.location ?? 'Local a definir'}</span>
                      </li>
                    ))
                  )}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-approvals">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-approvals" className="neo-panel__title">
                Pedidos e aprovações
              </h2>
              <p className="neo-panel__subtitle">
                {dashboard.approvals.pending > 0
                  ? `${dashboard.approvals.pending} pedido(s) a aguardar decisão.`
                  : 'Sem pedidos pendentes.'}
              </p>
            </div>
          </div>
          <ul className="trainer-dashboard__approvals">
            {dashboard.approvals.recent.map((approval) => (
              <li
                key={approval.id}
                className={`trainer-dashboard__approvals-item trainer-dashboard__approvals-item--${approvalToneClass(approval.tone)}`}
              >
                <div className="trainer-dashboard__approvals-header">
                  <span className="trainer-dashboard__approvals-client">{approval.clientName}</span>
                  <span className="trainer-dashboard__approvals-status">{approval.status}</span>
                </div>
                <p className="trainer-dashboard__approvals-meta">
                  {approval.type ?? 'Pedido'} · {approval.requestedLabel}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="trainer-dashboard__grid trainer-dashboard__grid--stack">
        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-upcoming">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-upcoming" className="neo-panel__title">
                Próximas sessões
              </h2>
              <p className="neo-panel__subtitle">Ordem cronológica das próximas marcações.</p>
            </div>
          </div>
          <ul className="trainer-dashboard__upcoming">
            {dashboard.upcoming.length === 0 ? (
              <li className="trainer-dashboard__upcoming-empty">Sem sessões agendadas.</li>
            ) : (
              dashboard.upcoming.map((session) => (
                <li
                  key={session.id}
                  className={`trainer-dashboard__upcoming-item trainer-dashboard__upcoming-item--${sessionToneClass(session.tone)}`}
                >
                  <div className="trainer-dashboard__upcoming-meta">
                    <span className="trainer-dashboard__upcoming-date">{session.dateLabel}</span>
                    <span className="trainer-dashboard__upcoming-time">{session.timeLabel}</span>
                  </div>
                  <div className="trainer-dashboard__upcoming-details">
                    <span className="trainer-dashboard__upcoming-client">{session.clientName}</span>
                    <span className="trainer-dashboard__upcoming-status">{session.status}</span>
                  </div>
                  <span className="trainer-dashboard__upcoming-location">{session.location ?? 'Local a definir'}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="neo-panel trainer-dashboard__panel" aria-labelledby="trainer-dashboard-clients">
          <div className="neo-panel__header trainer-dashboard__panel-header">
            <div className="neo-panel__meta">
              <h2 id="trainer-dashboard-clients" className="neo-panel__title">
                Carteira de clientes
              </h2>
              <p className="neo-panel__subtitle">Resumo de acompanhamento por cliente.</p>
            </div>
            <div className="trainer-dashboard__clients-tools">
              <div className="trainer-dashboard__clients-search">
                <input
                  type="search"
                  placeholder="Filtrar clientes"
                  value={clientQuery}
                  onChange={(event) => setClientQuery(event.target.value)}
                  className="trainer-dashboard__clients-input"
                  aria-label="Filtrar clientes"
                />
              </div>
              <div className="trainer-dashboard__clients-sort">
                <label htmlFor="trainer-dashboard-clients-sort" className="trainer-dashboard__clients-sort-label">
                  Ordenar
                </label>
                <select
                  id="trainer-dashboard-clients-sort"
                  className="trainer-dashboard__clients-sort-select"
                  value={clientSort}
                  onChange={(event) => setClientSort(event.target.value as ClientSort)}
                  aria-describedby="trainer-dashboard-clients-sort-description"
                >
                  {CLIENT_SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p id="trainer-dashboard-clients-sort-description" className="trainer-dashboard__clients-sort-description">
                  {CLIENT_SORT_OPTIONS.find((option) => option.id === clientSort)?.description}
                </p>
              </div>
              <div className="trainer-dashboard__tone-toggle" role="group" aria-label="Filtrar por prioridade">
                {CLIENT_TONE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className="trainer-dashboard__tone-button"
                    data-active={clientToneFilter === filter.id}
                    data-tone={filter.tone ?? 'all'}
                    aria-pressed={clientToneFilter === filter.id}
                    onClick={() => setClientToneFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="trainer-dashboard__clients-actions">
                {hasFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="trainer-dashboard__clients-clear"
                  >
                    Limpar filtros
                  </Button>
                )}
                <Button
                  onClick={exportClients}
                  variant="ghost"
                  size="sm"
                  leftIcon={<Download size={16} aria-hidden />}
                  disabled={filteredClients.length === 0}
                >
                  Exportar CSV
                </Button>
              </div>
            </div>
          </div>
          <div className="trainer-dashboard__clients-summary" aria-live="polite">
            <span className="trainer-dashboard__clients-summary-item">
              {clientStats.totalLabel} cliente(s)
            </span>
            <span className="trainer-dashboard__clients-summary-item">
              {clientStats.upcomingLabel} sessão(ões) futuras
            </span>
            <span className="trainer-dashboard__clients-summary-item">
              {clientStats.completedLabel} concluídas
            </span>
            <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--attention">
              {clientStats.attentionLabel} a precisar de atenção
            </span>
            <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--rate">
              {clientStats.attentionRateLabel} da carteira em alerta
            </span>
          </div>
          <div className="trainer-dashboard__clients-table" role="table">
            <div className="trainer-dashboard__clients-row trainer-dashboard__clients-row--head" role="row">
              <div role="columnheader">Cliente</div>
              <div role="columnheader">Próximas</div>
              <div role="columnheader">Concluídas</div>
              <div role="columnheader">Última sessão</div>
              <div role="columnheader">Próxima sessão</div>
            </div>
            {filteredClients.length === 0 ? (
              <div className="trainer-dashboard__clients-empty" role="row">
                <div role="cell">
                  <p>Nenhum cliente corresponde ao filtro.</p>
                  {hasFilters && (
                    <button type="button" className="trainer-dashboard__clients-reset" onClick={clearFilters}>
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`trainer-dashboard__clients-row trainer-dashboard__clients-row--${clientToneClass(client.tone)}`}
                  role="row"
                >
                  <div role="cell" className="trainer-dashboard__clients-name">
                    <span>{client.name}</span>
                    {client.email && <span className="trainer-dashboard__clients-email">{client.email}</span>}
                  </div>
                  <div role="cell">{numberFormatter.format(client.upcoming)}</div>
                  <div role="cell">{numberFormatter.format(client.completed)}</div>
                  <div role="cell">{client.lastSessionLabel}</div>
                  <div role="cell">{client.nextSessionLabel}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
