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
  TrainerWorkoutsDashboardData,
  TrainerWorkoutDistributionStat,
  TrainerWorkoutTableRow,
} from '@/lib/trainer/workouts/types';

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível atualizar os treinos.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível atualizar os treinos.');
  }
  return payload as DashboardResponse;
};

type DashboardResponse = TrainerWorkoutsDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type Props = {
  initialData: DashboardResponse;
  viewerName: string | null;
};

const percentageFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });
const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-PT');
}

function toneClass(tone: string | undefined | null) {
  switch (tone) {
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

function distributionWidth(stat: TrainerWorkoutDistributionStat) {
  if (!Number.isFinite(stat.percentage)) return '0%';
  return `${Math.max(0, Math.min(100, stat.percentage)).toFixed(1)}%`;
}

function exportSessions(rows: TrainerWorkoutTableRow[]) {
  const header = [
    'ID',
    'Sessão',
    'Início',
    'Duração',
    'Cliente',
    'Email',
    'Estado',
    'Local',
    'Plano',
    'Notas',
  ];
  const body = rows.map((row) => [
    row.id,
    row.title,
    row.startLabel,
    row.durationLabel,
    row.clientName,
    row.clientEmail ?? '',
    row.attendanceLabel,
    row.location ?? '',
    row.planTitle ?? '',
    row.notes ?? '',
  ]);
  const csv = [header, ...body]
    .map((cols) =>
      cols
        .map((value) => {
          const normalized = value.replace(/\r?\n|\r/g, ' ').trim();
          const needsQuotes = /[",;]/.test(normalized);
          const escaped = normalized.replace(/"/g, '""');
          return needsQuotes ? `"${escaped}"` : escaped;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `treinos-pt-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function distributionTone(stat: TrainerWorkoutDistributionStat) {
  if (stat.tone === 'positive') return 'Boa retenção';
  if (stat.tone === 'warning') return 'Acompanhar';
  if (stat.tone === 'critical') return 'Necessita atenção';
  return 'Indefinido';
}

function TimelineTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as { label: string; scheduled: number; completed: number; cancelled: number };
  return (
    <div className="trainer-workouts__tooltip">
      <div className="trainer-workouts__tooltip-label">{point.label}</div>
      <div className="trainer-workouts__tooltip-row">
        <span>Agendados</span>
        <strong>{point.scheduled}</strong>
      </div>
      <div className="trainer-workouts__tooltip-row">
        <span>Concluídos</span>
        <strong>{point.completed}</strong>
      </div>
      <div className="trainer-workouts__tooltip-row">
        <span>Cancelados</span>
        <strong>{point.cancelled}</strong>
      </div>
    </div>
  );
}

export default function PTWorkoutsClient({ initialData, viewerName }: Props) {
  const { data, error, isValidating, mutate } = useSWR<DashboardResponse>('/api/pt/workouts/dashboard', fetcher, {
    fallbackData: initialData,
    revalidateOnMount: true,
  });

  const dashboard = data ?? initialData;
  const supabaseState = dashboard.supabase ? 'ok' : 'warn';
  const supabaseLabel = dashboard.supabase ? 'Dados em tempo real' : 'Modo offline';

  const [query, setQuery] = React.useState('');
  const filteredSessions = React.useMemo(() => {
    if (!query.trim()) return dashboard.rows;
    const value = query.trim().toLowerCase();
    return dashboard.rows.filter((row) =>
      [row.title, row.clientName, row.clientEmail ?? '', row.attendanceLabel, row.location ?? '', row.planTitle ?? '']
        .join(' ')
        .toLowerCase()
        .includes(value),
    );
  }, [dashboard.rows, query]);

  return (
    <div className="trainer-workouts">
      <PageHeader
        title="Agenda de treinos"
        subtitle={
          viewerName
            ? `Visão geral das sessões planeadas e concluídas por ${viewerName}.`
            : 'Visão geral das sessões planeadas e concluídas.'
        }
        actions={
          <div className="trainer-workouts__actions">
            <span className="status-pill" data-state={supabaseState}>
              {supabaseLabel}
            </span>
            <Button onClick={() => mutate()} variant="ghost" size="sm" disabled={isValidating}>
              Atualizar
            </Button>
          </div>
        }
        sticky={false}
      />

      {error && (
        <Alert tone="danger" className="trainer-workouts__alert" title="Falha na sincronização">
          {error.message || 'Não foi possível ligar ao servidor. A mostrar dados locais.'}
        </Alert>
      )}

      <section className="neo-panel trainer-workouts__panel" aria-labelledby="trainer-workouts-hero">
        <header className="trainer-workouts__panel-header">
          <div>
            <h2 id="trainer-workouts-hero">Métricas principais</h2>
            <p>Resumo dos indicadores chave da semana e atividade recente.</p>
          </div>
          <span className="trainer-workouts__panel-meta">Atualizado {formatUpdatedAt(dashboard.updatedAt)}</span>
        </header>
        <div className="trainer-workouts__hero-grid">
          {dashboard.hero.map((metric) => (
            <article key={metric.id} className="trainer-workouts__hero" data-tone={toneClass(metric.tone)}>
              <span className="trainer-workouts__hero-label">{metric.label}</span>
              <strong className="trainer-workouts__hero-value">{metric.value}</strong>
              {metric.hint ? <span className="trainer-workouts__hero-hint">{metric.hint}</span> : null}
              {metric.trend ? <span className="trainer-workouts__hero-trend">{metric.trend}</span> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel trainer-workouts__panel" aria-labelledby="trainer-workouts-distribution">
        <header className="trainer-workouts__panel-header">
          <div>
            <h2 id="trainer-workouts-distribution">Estado das sessões</h2>
            <p>Distribuição das presenças e cancelamentos nas últimas semanas.</p>
          </div>
        </header>
        <div className="trainer-workouts__distribution">
          {dashboard.distribution.map((stat) => (
            <article key={stat.id} className="trainer-workouts__distribution-item" data-tone={toneClass(stat.tone)}>
              <header>
                <span className="trainer-workouts__distribution-label">{stat.label}</span>
                <strong>{numberFormatter.format(stat.count)}</strong>
              </header>
              <div className="trainer-workouts__distribution-bar">
                <span style={{ width: distributionWidth(stat) }} aria-hidden />
              </div>
              <footer>
                <span>{percentageFormatter.format(stat.percentage)}%</span>
                <span>{distributionTone(stat)}</span>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel trainer-workouts__panel" aria-labelledby="trainer-workouts-timeline">
        <header className="trainer-workouts__panel-header">
          <div>
            <h2 id="trainer-workouts-timeline">Timeline de treinos</h2>
            <p>Volume diário de sessões agendadas, concluídas e canceladas.</p>
          </div>
        </header>
        <div className="trainer-workouts__chart">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dashboard.timeline} margin={{ left: 0, right: 0, top: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="trainer-workouts__chart-grid" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<TimelineTooltip />} />
              <Area type="monotone" dataKey="scheduled" stroke="var(--neo-chart-primary)" fill="var(--neo-chart-primary-fill)" />
              <Area type="monotone" dataKey="completed" stroke="var(--neo-chart-success)" fill="var(--neo-chart-success-fill)" />
              <Area type="monotone" dataKey="cancelled" stroke="var(--neo-chart-danger)" fill="var(--neo-chart-danger-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="neo-panel trainer-workouts__panel" aria-labelledby="trainer-workouts-highlights">
        <header className="trainer-workouts__panel-header">
          <div>
            <h2 id="trainer-workouts-highlights">Insights e alertas</h2>
            <p>Pontos de atenção com base nas tendências das últimas semanas.</p>
          </div>
        </header>
        <div className="trainer-workouts__highlights">
          {dashboard.highlights.map((highlight) => (
            <article key={highlight.id} className="trainer-workouts__highlight" data-tone={toneClass(highlight.tone)}>
              <h3>{highlight.title}</h3>
              <p>{highlight.description}</p>
              {highlight.meta ? <span>{highlight.meta}</span> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel trainer-workouts__panel" aria-labelledby="trainer-workouts-clients">
        <header className="trainer-workouts__panel-header">
          <div>
            <h2 id="trainer-workouts-clients">Clientes envolvidos</h2>
            <p>Clientes com mais sessões planeadas e concluídas recentemente.</p>
          </div>
        </header>
        <div className="trainer-workouts__clients">
          {dashboard.clients.length === 0 ? (
            <p className="trainer-workouts__empty">Ainda não existem clientes com sessões registadas.</p>
          ) : (
            dashboard.clients.map((client) => (
              <article key={client.id} className="trainer-workouts__client" data-tone={toneClass(client.tone)}>
                <header>
                  <strong>{client.name}</strong>
                  {client.email ? <span>{client.email}</span> : null}
                </header>
                <dl>
                  <div>
                    <dt>Próximas sessões</dt>
                    <dd>{numberFormatter.format(client.upcoming)}</dd>
                  </div>
                  <div>
                    <dt>Concluídas</dt>
                    <dd>{numberFormatter.format(client.completed)}</dd>
                  </div>
                  <div>
                    <dt>Taxa de conclusão</dt>
                    <dd>{percentageFormatter.format(client.completionRate * 100)}%</dd>
                  </div>
                </dl>
                <footer>
                  <span>Próxima sessão</span>
                  <strong>{client.nextSessionLabel}</strong>
                </footer>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="neo-panel trainer-workouts__panel" aria-labelledby="trainer-workouts-sessions">
        <header className="trainer-workouts__panel-header">
          <div>
            <h2 id="trainer-workouts-sessions">Próximas sessões</h2>
            <p>Lista detalhada das sessões futuras e estado de presença.</p>
          </div>
          <div className="trainer-workouts__table-actions">
            <input
              type="search"
              className="neo-field"
              placeholder="Filtrar por cliente, plano ou estado"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button onClick={() => exportSessions(filteredSessions)} variant="secondary" size="sm">
              Exportar CSV
            </Button>
          </div>
        </header>
        {filteredSessions.length === 0 ? (
          <p className="trainer-workouts__empty">Nenhuma sessão corresponde aos filtros aplicados.</p>
        ) : (
          <div className="trainer-workouts__table-wrapper">
            <table className="trainer-workouts__table">
              <thead>
                <tr>
                  <th>Início</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Duração</th>
                  <th>Local</th>
                  <th>Plano</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((row) => (
                  <tr key={row.id}>
                    <td>{row.startLabel}</td>
                    <td>
                      <div className="trainer-workouts__cell">
                        <strong>{row.clientName}</strong>
                        {row.clientEmail ? <span>{row.clientEmail}</span> : null}
                      </div>
                    </td>
                    <td>
                      <span className={`trainer-workouts__status trainer-workouts__status--${toneClass(row.attendanceTone)}`}>
                        {row.attendanceLabel}
                      </span>
                    </td>
                    <td>{row.durationLabel}</td>
                    <td>{row.location ?? '—'}</td>
                    <td>{row.planTitle ?? '—'}</td>
                    <td>{row.notes ? row.notes : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
