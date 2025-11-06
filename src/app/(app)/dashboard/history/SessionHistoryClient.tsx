'use client';

import * as React from 'react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import LineChart from '@/components/dashboard/LineChart';
import type { SessionHistoryDataset, SessionHistoryRow } from '@/lib/history/types';
import type { AppRole } from '@/lib/roles';

const PERIOD_OPTIONS = [
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '180', label: 'Últimos 6 meses' },
  { value: '365', label: 'Últimos 12 meses' },
  { value: 'all', label: 'Todos os registos' },
] as const;

type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value'];

type StatusFilter = 'all' | 'completed' | 'pending' | 'cancelled';

type Props = {
  data: SessionHistoryDataset;
  role: AppRole;
  supabase: boolean;
  viewerName?: string | null;
};

type StatusMeta = {
  label: string;
  tone: 'success' | 'warning' | 'danger';
};

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: 'Todos os estados',
  completed: 'Concluídas',
  pending: 'Pendentes',
  cancelled: 'Canceladas',
};

const STATUS_META: Record<'completed' | 'pending' | 'cancelled', StatusMeta> = {
  completed: { label: 'Concluída', tone: 'success' },
  pending: { label: 'Pendente', tone: 'warning' },
  cancelled: { label: 'Cancelada', tone: 'danger' },
};

const MILLIS_PER_DAY = 86_400_000;

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateTime(value: string | null | undefined): string {
  const d = parseDate(value);
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return '—';
  }
}

function formatDuration(mins: number | null | undefined): string {
  if (!mins || Number.isNaN(mins)) return '—';
  return `${Math.round(mins)} min`;
}

function statusKind(row: SessionHistoryRow): 'completed' | 'pending' | 'cancelled' {
  const fields = [row.status, row.attendance];
  for (const field of fields) {
    if (!field) continue;
    const status = field.toLowerCase();
    if (/(cancel|declin|no[_\-\s]?show|ausent)/.test(status)) return 'cancelled';
    if (/(complete|confirm|done|finished|attend|success)/.test(status)) return 'completed';
    if (/(reschedule|pending|schedul|await|request|plan)/.test(status)) return 'pending';
  }
  return 'pending';
}

function matchesQuery(row: SessionHistoryRow, query: string): boolean {
  if (!query) return true;
  const tokens: string[] = [];
  if (row.trainer?.name) tokens.push(row.trainer.name);
  if (row.trainer?.email) tokens.push(row.trainer.email);
  if (row.client?.name) tokens.push(row.client.name);
  if (row.client?.email) tokens.push(row.client.email);
  if (row.location) tokens.push(row.location);
  if (row.notes) tokens.push(row.notes);
  const q = query.toLowerCase();
  return tokens.some((token) => token.toLowerCase().includes(q));
}

function downloadCSV(rows: string[][], filename: string) {
  if (rows.length === 0) return;
  const csv = rows
    .map((cols) =>
      cols
        .map((value) => {
          const safe = value ?? '';
          if (/[",\n]/.test(safe)) {
            return `"${safe.replace(/"/g, '""')}"`;
          }
          return safe;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatPercentage(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(0)}%`;
}

function firstNameOf(value?: string | null): string | null {
  if (!value) return null;
  const parts = value.trim().split(/\s+/);
  if (!parts.length) return null;
  return parts[0] ?? null;
}

function formatMonthKey(date: Date): string {
  return new Intl.DateTimeFormat('pt-PT', { month: 'short', year: '2-digit' }).format(date);
}

function getDurationMinutes(row: SessionHistoryRow): number | null {
  if (typeof row.durationMin === 'number' && !Number.isNaN(row.durationMin)) {
    return row.durationMin;
  }
  const start = parseDate(row.startAt);
  const end = parseDate(row.endAt);
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

export default function SessionHistoryClient({ data, role, supabase, viewerName }: Props) {
  const [period, setPeriod] = React.useState<PeriodValue>('90');
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [search, setSearch] = React.useState('');
  const [upcomingOnly, setUpcomingOnly] = React.useState(false);

  const generatedAt = React.useMemo(() => parseDate(data.generatedAt) ?? new Date(), [data.generatedAt]);
  const initialRows = data.rows ?? [];
  const isFallback = !supabase;

  const [startRange, endRange] = React.useMemo(() => {
    if (period === 'all') {
      return [null, null] as const;
    }
    const end = new Date(generatedAt);
    const start = new Date(end.getTime() - Number(period) * MILLIS_PER_DAY);
    return [start, end] as const;
  }, [generatedAt, period]);

  const filteredRows = React.useMemo(() => {
    const now = new Date();
    return initialRows.filter((row) => {
      const when = parseDate(row.scheduledAt) ?? parseDate(row.startAt) ?? null;
      if (startRange && when && when < startRange) return false;
      if (endRange && when && when > endRange) return false;
      if (upcomingOnly && when && when < now) return false;
      if (status !== 'all' && statusKind(row) !== status) return false;
      if (search && !matchesQuery(row, search)) return false;
      return true;
    });
  }, [initialRows, startRange, endRange, status, search, upcomingOnly]);

  const totals = React.useMemo(() => {
    let completed = 0;
    let pending = 0;
    let cancelled = 0;
    let durationSum = 0;
    let durationCount = 0;
    const trainerIds = new Set<string>();
    const clientIds = new Set<string>();
    let future = 0;

    const now = new Date();

    for (const row of filteredRows) {
      const kind = statusKind(row);
      if (kind === 'completed') completed += 1;
      else if (kind === 'cancelled') cancelled += 1;
      else pending += 1;

      const duration = getDurationMinutes(row);
      if (typeof duration === 'number' && duration > 0) {
        durationSum += duration;
        durationCount += 1;
      }

      if (row.trainer?.id) trainerIds.add(row.trainer.id);
      if (row.client?.id) clientIds.add(row.client.id);

      const when = parseDate(row.scheduledAt) ?? parseDate(row.startAt);
      if (when && when > now) future += 1;
    }

    const total = filteredRows.length;
    const completionRate = total ? (completed / total) * 100 : 0;
    const cancellationRate = total ? (cancelled / total) * 100 : 0;
    const avgDuration = durationCount ? durationSum / durationCount : 0;

    return {
      total,
      completed,
      pending,
      cancelled,
      completionRate,
      cancellationRate,
      avgDuration,
      trainers: trainerIds.size,
      clients: clientIds.size,
      upcoming: future,
    };
  }, [filteredRows]);

  const timelineSeries = React.useMemo(() => {
    const map = new Map<string, { count: number; date: Date }>();
    for (const row of filteredRows) {
      const when = parseDate(row.scheduledAt) ?? parseDate(row.startAt);
      if (!when) continue;
      const key = `${when.getFullYear()}-${String(when.getMonth() + 1).padStart(2, '0')}`;
      const current = map.get(key) ?? { count: 0, date: new Date(when.getFullYear(), when.getMonth(), 1) };
      current.count += 1;
      map.set(key, current);
    }
    return Array.from(map.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((item) => ({ name: formatMonthKey(item.date), value: item.count }));
  }, [filteredRows]);

  const topTrainers = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const row of filteredRows) {
      if (!row.trainer?.id) continue;
      const key = row.trainer.id;
      const entry = map.get(key) ?? { id: key, name: row.trainer.name || key, count: 0 };
      entry.count += 1;
      entry.name = row.trainer.name || entry.name;
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredRows]);

  const topClients = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const row of filteredRows) {
      if (!row.client?.id) continue;
      const key = row.client.id;
      const entry = map.get(key) ?? { id: key, name: row.client.name || key, count: 0 };
      entry.count += 1;
      entry.name = row.client.name || entry.name;
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredRows]);

  const topLocations = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const row of filteredRows) {
      if (!row.location) continue;
      const key = row.location.trim();
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredRows]);

  const handleExport = React.useCallback(() => {
    const rows = [
      ['ID', 'Data agendada', 'Personal Trainer', 'Cliente', 'Estado', 'Local', 'Notas'],
      ...filteredRows.map((row) => [
        row.id,
        formatDateTime(row.scheduledAt ?? row.startAt),
        row.trainer?.name ?? '—',
        row.client?.name ?? '—',
        STATUS_META[statusKind(row)].label,
        row.location ?? '—',
        row.notes ?? '',
      ]),
    ];
    downloadCSV(rows, 'historico-sessoes.csv');
  }, [filteredRows]);

  const handleReset = React.useCallback(() => {
    setPeriod('90');
    setStatus('all');
    setSearch('');
    setUpcomingOnly(false);
  }, []);

  const greetingName = React.useMemo(() => firstNameOf(viewerName), [viewerName]);
  const disableExport = filteredRows.length === 0;

  const statusBadge = React.useCallback((row: SessionHistoryRow) => {
    const kind = statusKind(row);
    const meta = STATUS_META[kind];
    return (
      <span className="status-pill" data-state={kind === 'cancelled' ? 'down' : kind === 'completed' ? 'ok' : 'warn'}>
        {meta.label}
      </span>
    );
  }, []);

  return (
    <section className="client-page history-dashboard neo-stack neo-stack--xl">
      <header className="neo-panel neo-panel--header history-dashboard__hero">
        <div className="neo-stack neo-stack--sm">
          <span className="caps-tag">Sessões</span>
          <h1 className="history-dashboard__title heading-solid">Histórico de sessões</h1>
          <p className="neo-text--sm neo-text--muted">
            Acompanha marcações, cancelamentos e presença nas sessões. Filtra por período, estado ou pesquisa rápida para
            localizar registos específicos.
          </p>
        </div>
        <div className="history-dashboard__meta neo-inline neo-inline--wrap neo-inline--sm">
          <span className="history-dashboard__badge" data-state={isFallback ? 'offline' : 'live'}>
            {isFallback
              ? 'Modo offline — sem sincronização ativa com o servidor'
              : 'Dados em tempo real via servidor'}
          </span>
          {greetingName ? <span>Olá, {greetingName}! 👋</span> : null}
          <span>Atualizado em {formatDateTime(generatedAt.toISOString())}</span>
        </div>
        {isFallback ? (
          <Alert tone="warning" title="Sem ligação ao servidor" role="status">
            Não foi possível sincronizar o histórico de sessões. Assim que a ligação for restabelecida voltamos a carregar os
            dados reais automaticamente.
          </Alert>
        ) : null}
      </header>

      <div className="history-dashboard__layout">
        <aside className="history-dashboard__filters neo-panel neo-panel--compact neo-stack neo-stack--lg" aria-label="Filtros do histórico">
          <div className="neo-input-group">
            <div className="neo-input-group__field">
              <label htmlFor="history-period" className="neo-input-group__label">
                Período
              </label>
              <select
                id="history-period"
                className="neo-input"
                value={period}
                onChange={(event) => setPeriod(event.target.value as PeriodValue)}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="neo-input-group">
            <div className="neo-input-group__field">
              <label htmlFor="history-status" className="neo-input-group__label">
                Estado
              </label>
              <select
                id="history-status"
                className="neo-input"
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
              >
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="neo-input-group">
            <div className="neo-input-group__field">
              <label htmlFor="history-search" className="neo-input-group__label">
                Pesquisa
              </label>
              <input
                id="history-search"
                className="neo-input"
                placeholder="Ex.: Estúdio A, Maria Lopes, mobilidade"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="history-dashboard__toggle">
            <label htmlFor="history-upcoming" className="history-dashboard__toggleLabel">
              <input
                id="history-upcoming"
                type="checkbox"
                checked={upcomingOnly}
                onChange={(event) => setUpcomingOnly(event.target.checked)}
              />
              Mostrar apenas sessões futuras
            </label>
            <p className="neo-text--xs neo-text--muted">
              Ideal para PTs acompanharem a agenda. Disponível para {role === 'CLIENT' ? 'os seus treinos' : 'toda a equipa'}.
            </p>
          </div>

          <div className="history-dashboard__actions neo-stack neo-stack--xs">
            <div className="neo-inline neo-inline--wrap neo-inline--sm">
              <Button variant="secondary" size="sm" onClick={handleExport} disabled={disableExport}>
                Exportar CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Repor filtros
              </Button>
            </div>
            <p className="neo-text--xs neo-text--muted">
              A exportação respeita o período, filtros e pesquisa aplicados.
            </p>
          </div>
        </aside>

        <div className="neo-stack neo-stack--lg">
          <section className="neo-panel neo-stack neo-stack--lg" aria-labelledby="history-metrics-heading">
            <div className="neo-stack neo-stack--xs">
              <h2 id="history-metrics-heading" className="history-dashboard__sectionTitle">
                Indicadores principais
              </h2>
              <p className="neo-text--sm neo-text--muted">
                Métricas calculadas com base nos filtros aplicados.
              </p>
            </div>

            <div className="history-dashboard__metrics neo-grid">
              <article className="neo-surface neo-surface--padded history-dashboard__metric" data-variant="primary">
                <span className="history-dashboard__metricLabel">Sessões filtradas</span>
                <span className="history-dashboard__metricValue">{totals.total}</span>
                <span className="history-dashboard__metricHint">
                  {startRange ? formatDateTime(startRange.toISOString()) : 'Todas as datas'} —
                  {endRange ? formatDateTime(endRange.toISOString()) : formatDateTime(generatedAt.toISOString())}
                </span>
              </article>
              <article className="neo-surface neo-surface--padded history-dashboard__metric" data-variant="success">
                <span className="history-dashboard__metricLabel">Taxa de conclusão</span>
                <span className="history-dashboard__metricValue">{formatPercentage(totals.completionRate)}</span>
                <span className="history-dashboard__metricHint">{totals.completed} sessões concluídas</span>
              </article>
              <article className="neo-surface neo-surface--padded history-dashboard__metric" data-variant="danger">
                <span className="history-dashboard__metricLabel">Taxa de cancelamento</span>
                <span className="history-dashboard__metricValue">{formatPercentage(totals.cancellationRate)}</span>
                <span className="history-dashboard__metricHint">{totals.cancelled} sessões canceladas</span>
              </article>
              <article className="neo-surface neo-surface--padded history-dashboard__metric" data-variant="info">
                <span className="history-dashboard__metricLabel">Duração média</span>
                <span className="history-dashboard__metricValue">
                  {totals.avgDuration ? `${Math.round(totals.avgDuration)} min` : '—'}
                </span>
                <span className="history-dashboard__metricHint">
                  {totals.upcoming} sessões futuras · {totals.clients} clientes · {totals.trainers} PTs
                </span>
              </article>
            </div>

            <div className="history-dashboard__chart">
              {timelineSeries.length > 1 ? (
                <LineChart data={timelineSeries} height={240} />
              ) : (
                <div className="neo-empty" role="status">
                  <span className="neo-empty__icon" aria-hidden>
                    📈
                  </span>
                  <p className="neo-empty__title">Sem dados suficientes</p>
                  <p className="neo-empty__description">
                    Alargue o período temporal para visualizar a tendência de sessões.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="neo-panel neo-stack neo-stack--lg" aria-labelledby="history-distribution-heading">
            <div className="neo-stack neo-stack--xs">
              <h2 id="history-distribution-heading" className="history-dashboard__sectionTitle">
                Distribuição por equipas e clientes
              </h2>
              <p className="neo-text--sm neo-text--muted">
                Identifique quem mais marcou treinos e os espaços mais utilizados.
              </p>
            </div>

            <div className="history-dashboard__lists neo-grid neo-grid--metricsSm">
              <section className="neo-stack neo-stack--sm" aria-labelledby="history-top-trainers">
                <h3 id="history-top-trainers" className="history-dashboard__listTitle">
                  Personal Trainers com mais sessões
                </h3>
                <ul className="neo-stack neo-stack--sm" aria-live="polite">
                  {topTrainers.length ? (
                    topTrainers.map((item) => (
                      <li
                        key={item.id}
                        className="neo-surface neo-surface--compact history-dashboard__listItem"
                        data-tone="neutral"
                      >
                        <span className="history-dashboard__listName">{item.name}</span>
                        <span className="history-dashboard__listValue">{item.count}</span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <div className="neo-empty" role="status">
                        <span className="neo-empty__icon" aria-hidden>
                          🧑‍🏫
                        </span>
                        <p className="neo-empty__title">Sem registos</p>
                        <p className="neo-empty__description">Ajuste os filtros ou recolha novos dados.</p>
                      </div>
                    </li>
                  )}
                </ul>
              </section>

              <section className="neo-stack neo-stack--sm" aria-labelledby="history-top-clients">
                <h3 id="history-top-clients" className="history-dashboard__listTitle">
                  Clientes mais ativos
                </h3>
                <ul className="neo-stack neo-stack--sm" aria-live="polite">
                  {topClients.length ? (
                    topClients.map((item) => (
                      <li
                        key={item.id}
                        className="neo-surface neo-surface--compact history-dashboard__listItem"
                        data-tone="success"
                      >
                        <span className="history-dashboard__listName">{item.name}</span>
                        <span className="history-dashboard__listValue">{item.count}</span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <div className="neo-empty" role="status">
                        <span className="neo-empty__icon" aria-hidden>
                          🧍
                        </span>
                        <p className="neo-empty__title">Sem clientes filtrados</p>
                        <p className="neo-empty__description">Remova a pesquisa para ver a distribuição geral.</p>
                      </div>
                    </li>
                  )}
                </ul>
              </section>

              <section className="neo-stack neo-stack--sm" aria-labelledby="history-top-locations">
                <h3 id="history-top-locations" className="history-dashboard__listTitle">
                  Espaços mais usados
                </h3>
                <ul className="neo-stack neo-stack--sm" aria-live="polite">
                  {topLocations.length ? (
                    topLocations.map((item) => (
                      <li
                        key={item.name}
                        className="neo-surface neo-surface--compact history-dashboard__listItem"
                        data-tone="info"
                      >
                        <span className="history-dashboard__listName">{item.name}</span>
                        <span className="history-dashboard__listValue">{item.count}</span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <div className="neo-empty" role="status">
                        <span className="neo-empty__icon" aria-hidden>
                          🏟️
                        </span>
                        <p className="neo-empty__title">Sem localizações</p>
                        <p className="neo-empty__description">
                          Complete sessões com local definido para acompanhar esta métrica.
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </section>
            </div>
          </section>

          <section className="neo-panel neo-stack neo-stack--lg" aria-labelledby="history-table-heading">
            <div className="neo-inline neo-inline--between neo-inline--wrap">
              <div className="neo-stack neo-stack--xs">
                <h2 id="history-table-heading" className="history-dashboard__sectionTitle">
                  Registos detalhados
                </h2>
                <p className="neo-text--sm neo-text--muted">
                  Mostramos até {initialRows.length} entradas mais recentes recebidas do servidor.
                </p>
              </div>
              <div className="history-dashboard__legend neo-inline neo-inline--sm">
                <span className="status-pill" data-state="ok">Concluída</span>
                <span className="status-pill" data-state="warn">Pendente</span>
                <span className="status-pill" data-state="down">Cancelada</span>
              </div>
            </div>

            <div className="history-dashboard__table" role="region" aria-live="polite">
              <table className="neo-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Personal Trainer</th>
                    <th>Cliente</th>
                    <th>Local</th>
                    <th>Duração</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length ? (
                    filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDateTime(row.scheduledAt ?? row.startAt)}</td>
                        <td className="history-dashboard__cellMuted">{row.trainer?.name ?? '—'}</td>
                        <td className="history-dashboard__cellMuted">{row.client?.name ?? '—'}</td>
                        <td className="history-dashboard__cellMuted">{row.location ?? '—'}</td>
                        <td>{formatDuration(getDurationMinutes(row))}</td>
                        <td>{statusBadge(row)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="neo-empty" role="status">
                          <span className="neo-empty__icon" aria-hidden>
                            📭
                          </span>
                          <p className="neo-empty__title">Sem sessões no intervalo</p>
                          <p className="neo-empty__description">
                            Ajuste filtros, datas ou remova a pesquisa para voltar a ver resultados.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
