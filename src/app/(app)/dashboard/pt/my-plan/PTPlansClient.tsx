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
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type {
  TrainerPlanStatusKey,
  TrainerPlansDashboardData,
  TrainerPlanTableRow,
} from '@/lib/trainer/plans/types';

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível atualizar os planos.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível atualizar os planos.');
  }
  return payload as DashboardResponse;
};

type DashboardResponse = TrainerPlansDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type Props = {
  initialData: DashboardResponse;
  viewerName: string | null;
};

const statusOrder: Array<'all' | TrainerPlanStatusKey> = ['all', 'active', 'draft', 'archived', 'deleted', 'unknown'];

function statusLabel(key: 'all' | TrainerPlanStatusKey) {
  switch (key) {
    case 'all':
      return 'Todos';
    case 'active':
      return 'Ativos';
    case 'draft':
      return 'Rascunhos';
    case 'archived':
      return 'Arquivados';
    case 'deleted':
      return 'Removidos';
    case 'unknown':
      return 'Sem estado';
    default:
      return key;
  }
}

function matchesQuery(row: TrainerPlanTableRow, query: string) {
  if (!query) return true;
  const value = query.toLowerCase();
  return [
    row.title.toLowerCase(),
    row.clientName.toLowerCase(),
    row.clientEmail?.toLowerCase() ?? '',
    row.statusLabel.toLowerCase(),
  ].some((field) => field.includes(value));
}

function exportPlans(rows: TrainerPlanTableRow[]) {
  const header = ['ID', 'Plano', 'Cliente', 'Email', 'Estado', 'Início', 'Fim', 'Última atualização'];
  const body = rows.map((row) => [
    row.id,
    row.title,
    row.clientName,
    row.clientEmail ?? '',
    row.statusLabel,
    row.startLabel,
    row.endLabel,
    row.updatedLabel,
  ]);
  const csv = [header, ...body]
    .map((columns) =>
      columns
        .map((value) => {
          const needsQuotes = value.includes(',') || value.includes(';') || value.includes('\n');
          const escaped = value.replace(/"/g, '""');
          return needsQuotes ? `"${escaped}"` : escaped;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `planos-pt-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export default function PTPlansClient({ initialData, viewerName }: Props) {
  const { data, error, isValidating, mutate } = useSWR<DashboardResponse>('/api/pt/plans/dashboard', fetcher, {
    fallbackData: initialData,
    revalidateOnMount: true,
  });

  const dashboard = data ?? initialData;
  const [statusFilter, setStatusFilter] = React.useState<'all' | TrainerPlanStatusKey>('all');
  const [query, setQuery] = React.useState('');

  const filteredRows = React.useMemo(() => {
    const base = statusFilter === 'all'
      ? dashboard.rows
      : dashboard.rows.filter((row) => row.status === statusFilter);
    if (!query.trim()) return base;
    return base.filter((row) => matchesQuery(row, query.trim()));
  }, [dashboard.rows, query, statusFilter]);

  const statusCounts = React.useMemo(() => {
    const map = new Map<'all' | TrainerPlanStatusKey, number>();
    map.set('all', dashboard.rows.length);
    dashboard.statuses.forEach((status) => {
      map.set(status.id, status.count);
    });
    return map;
  }, [dashboard.rows.length, dashboard.statuses]);

  const supabaseState = dashboard.supabase ? 'ok' : 'warn';
  const supabaseLabel = dashboard.supabase ? 'Dados em tempo real' : 'Modo offline';

  return (
    <div className="trainer-plans">
      <PageHeader
        title="Planos de treino"
        subtitle={viewerName ? `Resumo das prescrições geridas por ${viewerName}.` : 'Resumo dos planos de treino ativos.'}
        actions={(
          <span className="status-pill" data-state={supabaseState}>
            {supabaseLabel}
          </span>
        )}
        sticky={false}
      />

      {error && (
        <Alert tone="danger" className="trainer-plans__alert" title="Falha na sincronização">
          {error.message || 'Não foi possível ligar ao servidor. A mostrar dados locais.'}
        </Alert>
      )}

      <section className="neo-panel trainer-plans__panel" aria-labelledby="trainer-plans-hero">
        <header className="trainer-plans__panelHeader">
          <div>
            <h2 id="trainer-plans-hero" className="neo-panel__title">
              Estado geral
            </h2>
            <p className="neo-panel__subtitle">
              Monitoriza a carga de trabalho e confirma quais os planos que precisam de intervenção imediata.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => mutate()} loading={isValidating}>
            Atualizar
          </Button>
        </header>
        <div className="trainer-plans__metrics" role="list">
          {dashboard.hero.map((metric) => (
            <article key={metric.id} className="neo-surface trainer-plans__metric" data-tone={metric.tone ?? 'neutral'}>
              <span className="neo-surface__hint">{metric.label}</span>
              <span className="neo-surface__value">{metric.value}</span>
              {metric.trend && <span className="neo-surface__trend">{metric.trend}</span>}
              {metric.hint && <p className="neo-surface__meta">{metric.hint}</p>}
            </article>
          ))}
        </div>
      </section>
      <section className="neo-panel trainer-plans__panel" aria-labelledby="trainer-plans-timeline">
        <header className="trainer-plans__panelHeader">
          <div>
            <h2 id="trainer-plans-timeline" className="neo-panel__title">
              Atualizações semanais
            </h2>
            <p className="neo-panel__subtitle">
              Evolução das criações, atualizações e arquivamentos de planos nas últimas semanas.
            </p>
          </div>
        </header>
        {dashboard.timeline.length ? (
          <div className="trainer-plans__chart">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dashboard.timeline} margin={{ top: 16, right: 24, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-border-subtle)" />
                <XAxis dataKey="label" stroke="var(--neo-text-subtle)" tickLine={false} fontSize={12} />
                <YAxis stroke="var(--neo-text-subtle)" allowDecimals={false} width={36} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--neo-surface-raised)',
                    borderRadius: 12,
                    border: '1px solid var(--neo-border-subtle)',
                  }}
                  labelStyle={{ color: 'var(--neo-text-primary)', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="var(--neo-chart-primary)"
                  fill="var(--neo-chart-primary)"
                  fillOpacity={0.35}
                  name="Criados"
                />
                <Area
                  type="monotone"
                  dataKey="updated"
                  stroke="var(--neo-chart-success)"
                  fill="var(--neo-chart-success)"
                  fillOpacity={0.25}
                  name="Atualizados"
                />
                <Area
                  type="monotone"
                  dataKey="archived"
                  stroke="var(--neo-chart-warning)"
                  fill="var(--neo-chart-warning)"
                  fillOpacity={0.2}
                  name="Arquivados"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="neo-empty trainer-plans__empty">
            <span className="neo-empty__icon" aria-hidden>
              📈
            </span>
            <p className="neo-empty__title">Sem dados suficientes</p>
            <p className="neo-empty__description">Cria ou atualiza planos para começar a acompanhar a evolução semanal.</p>
          </div>
        )}
      </section>

      <section className="neo-panel trainer-plans__panel" aria-labelledby="trainer-plans-statuses">
        <header className="trainer-plans__panelHeader">
          <div>
            <h2 id="trainer-plans-statuses" className="neo-panel__title">
              Distribuição por estado
            </h2>
            <p className="neo-panel__subtitle">
              Avalia onde investir tempo: finalizar rascunhos, acompanhar ativos e arquivar concluídos.
            </p>
          </div>
        </header>
        <ul className="trainer-plans__statuses">
          {dashboard.statuses.map((status) => (
            <li key={status.id}>
              <div className="trainer-plans__statusHeader">
                <span className="trainer-plans__statusLabel">{status.label}</span>
                <span className="trainer-plans__statusValue">{status.count}</span>
              </div>
              <div
                className="trainer-plans__statusBar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={status.percentage}
              >
                <span
                  className="trainer-plans__statusFill"
                  data-tone={status.tone}
                  style={{ width: `${Math.min(100, status.percentage)}%` }}
                />
              </div>
              <p className="trainer-plans__statusMeta">{status.percentage.toFixed(1)}%</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="neo-panel trainer-plans__panel" aria-labelledby="trainer-plans-highlights">
        <header className="trainer-plans__panelHeader">
          <div>
            <h2 id="trainer-plans-highlights" className="neo-panel__title">
              Destaques operacionais
            </h2>
            <p className="neo-panel__subtitle">Alertas rápidos para direcionar o acompanhamento dos clientes.</p>
          </div>
        </header>
        <div className="trainer-plans__highlights">
          {dashboard.highlights.map((highlight) => (
            <article key={highlight.id} className="neo-surface trainer-plans__highlight" data-tone={highlight.tone}>
              <span className="neo-surface__hint">{highlight.title}</span>
              {highlight.value && <span className="neo-surface__value">{highlight.value}</span>}
              <p className="neo-surface__meta">{highlight.description}</p>
              {highlight.meta && <span className="neo-surface__meta trainer-plans__highlightMeta">{highlight.meta}</span>}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel trainer-plans__panel" aria-labelledby="trainer-plans-clients">
        <header className="trainer-plans__panelHeader">
          <div>
            <h2 id="trainer-plans-clients" className="neo-panel__title">
              Clientes em acompanhamento
            </h2>
            <p className="neo-panel__subtitle">Top clientes pela atividade recente para priorizar feedback e ajustes.</p>
          </div>
        </header>
        <div className="trainer-plans__clients">
          {dashboard.clients.map((client) => (
            <article key={client.id} className="neo-surface trainer-plans__client" data-tone={client.tone}>
              <header className="trainer-plans__clientHeader">
                <h3>{client.name}</h3>
                {client.email && <span className="trainer-plans__clientEmail">{client.email}</span>}
              </header>
              <dl className="trainer-plans__clientStats">
                <div>
                  <dt>Planos ativos</dt>
                  <dd>{client.activePlans}</dd>
                </div>
                <div>
                  <dt>Total de planos</dt>
                  <dd>{client.totalPlans}</dd>
                </div>
                <div>
                  <dt>Última atualização</dt>
                  <dd>{client.lastUpdateLabel}</dd>
                </div>
              </dl>
            </article>
          ))}
          {!dashboard.clients.length && (
            <div className="neo-empty trainer-plans__empty">
              <span className="neo-empty__icon" aria-hidden>
                🙋‍♀️
              </span>
              <p className="neo-empty__title">Sem clientes associados</p>
              <p className="neo-empty__description">Atribui planos aos teus clientes para acompanhar o progresso aqui.</p>
            </div>
          )}
        </div>
      </section>
      <section className="neo-panel trainer-plans__panel" aria-labelledby="trainer-plans-table">
        <header className="trainer-plans__panelHeader trainer-plans__panelHeader--table">
          <div>
            <h2 id="trainer-plans-table" className="neo-panel__title">
              Listagem detalhada
            </h2>
            <p className="neo-panel__subtitle">
              Pesquisa, filtra e exporta os planos atribuídos para cada cliente.
            </p>
          </div>
          <div className="trainer-plans__actions">
            <div className="neo-input-group trainer-plans__searchGroup">
              <label htmlFor="trainer-plans-search" className="neo-input-group__label">
                Pesquisar
              </label>
              <input
                id="trainer-plans-search"
                className="neo-input"
                placeholder="Filtrar por plano ou cliente"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button variant="secondary" size="sm" onClick={() => exportPlans(filteredRows)} disabled={!filteredRows.length}>
              Exportar CSV
            </Button>
          </div>
        </header>
        <div className="trainer-plans__filters" role="tablist" aria-label="Filtrar por estado">
          {statusOrder.map((key) => (
            <button
              key={key}
              type="button"
              className="trainer-plans__filter"
              data-active={statusFilter === key}
              onClick={() => setStatusFilter(key)}
            >
              <span>{statusLabel(key)}</span>
              <span className="trainer-plans__filterCount">{statusCounts.get(key) ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="neo-table-wrapper" role="region" aria-live="polite">
          {filteredRows.length === 0 ? (
            <div className="neo-empty trainer-plans__empty">
              <span className="neo-empty__icon" aria-hidden>
                🗂️
              </span>
              <p className="neo-empty__title">Nenhum plano encontrado</p>
              <p className="neo-empty__description">Ajusta os filtros ou limpa a pesquisa para voltar a listar todos os planos.</p>
            </div>
          ) : (
            <table className="neo-table trainer-plans__table">
              <thead>
                <tr>
                  <th scope="col">Plano</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Início</th>
                  <th scope="col">Fim</th>
                  <th scope="col">Última atualização</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="trainer-plans__cellTitle">{row.title}</div>
                    </td>
                    <td>
                      <div className="trainer-plans__cellTitle">{row.clientName}</div>
                      {row.clientEmail && <div className="trainer-plans__cellMeta">{row.clientEmail}</div>}
                    </td>
                    <td>
                      <span className="trainer-plans__statusBadge" data-tone={row.statusTone}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td>{row.startLabel}</td>
                    <td>{row.endLabel}</td>
                    <td>{row.updatedLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
