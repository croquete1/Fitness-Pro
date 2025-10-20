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

type ClientToneFilter = 'all' | TrainerClientSnapshot['tone'];

const CLIENT_TONE_FILTERS: Array<{ id: ClientToneFilter; label: string; tone: TrainerClientSnapshot['tone'] | null }> = [
  { id: 'all', label: 'Todos', tone: null },
  { id: 'positive', label: 'Em progresso', tone: 'positive' },
  { id: 'warning', label: 'Atenção', tone: 'warning' },
  { id: 'critical', label: 'Risco', tone: 'critical' },
  { id: 'neutral', label: 'Sem alerta', tone: 'neutral' },
];

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

function heroToneClass(metric: TrainerHeroMetric) {
  switch (metric.tone) {
    case 'positive':
      return 'positive';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'critical';
    default:
      return 'neutral';
  }
}

function highlightToneClass(highlight: TrainerHighlight) {
  switch (highlight.tone) {
    case 'positive':
      return 'positive';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'critical';
    default:
      return 'info';
  }
}

function sessionToneClass(tone: TrainerUpcomingSession['tone'] | TrainerAgendaSession['tone']) {
  switch (tone) {
    case 'positive':
      return 'positive';
    case 'critical':
      return 'critical';
    default:
      return 'warning';
  }
}

function clientToneClass(tone: TrainerClientSnapshot['tone']) {
  switch (tone) {
    case 'positive':
      return 'positive';
    case 'critical':
      return 'critical';
    case 'warning':
      return 'warning';
    default:
      return 'neutral';
  }
}

function approvalToneClass(tone: TrainerApprovalItem['tone']) {
  switch (tone) {
    case 'positive':
      return 'positive';
    case 'critical':
      return 'critical';
    case 'warning':
      return 'warning';
    default:
      return 'neutral';
  }
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
  const supabaseState = dashboard.supabase ? 'ok' : 'warn';
  const supabaseLabel = dashboard.supabase ? 'Dados em tempo real' : 'Modo offline';

  const greeting = React.useMemo(() => firstName(viewerName ?? dashboard.trainerName), [viewerName, dashboard.trainerName]);

  const [clientQuery, setClientQuery] = React.useState('');
  const [clientToneFilter, setClientToneFilter] = React.useState<ClientToneFilter>('all');

  const filteredClients = React.useMemo(() => {
    const query = clientQuery.trim().toLowerCase();

    return dashboard.clients.filter((client) => {
      const matchesQuery = !query
        ? true
        : [client.name, client.email ?? '', client.lastSessionLabel, client.nextSessionLabel]
            .join(' ')
            .toLowerCase()
            .includes(query);
      const matchesTone = clientToneFilter === 'all' ? true : client.tone === clientToneFilter;
      return matchesQuery && matchesTone;
    });
  }, [dashboard.clients, clientQuery, clientToneFilter]);

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

    return {
      ...totals,
      upcomingLabel: numberFormatter.format(totals.upcoming),
      completedLabel: numberFormatter.format(totals.completed),
    };
  }, [filteredClients]);

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
      client.tone,
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
            <span className="status-pill" data-state={supabaseState}>
              {supabaseLabel}
            </span>
            <Button onClick={() => mutate()} variant="ghost" size="sm" disabled={isValidating}>
              Actualizar
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
              <div className="trainer-dashboard__tone-toggle" role="group" aria-label="Filtrar por prioridade">
                {CLIENT_TONE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className="trainer-dashboard__tone-button"
                    data-active={clientToneFilter === filter.id}
                    data-tone={filter.tone ?? 'all'}
                    onClick={() => setClientToneFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
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
          <div className="trainer-dashboard__clients-summary" aria-live="polite">
            <span className="trainer-dashboard__clients-summary-item">
              {clientStats.total} cliente(s)
            </span>
            <span className="trainer-dashboard__clients-summary-item">
              {clientStats.upcomingLabel} sessão(ões) futuras
            </span>
            <span className="trainer-dashboard__clients-summary-item">
              {clientStats.completedLabel} concluídas
            </span>
            <span className="trainer-dashboard__clients-summary-item trainer-dashboard__clients-summary-item--critical">
              {clientStats.attention} a precisar de atenção
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
                <div role="cell">Nenhum cliente corresponde ao filtro.</div>
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
