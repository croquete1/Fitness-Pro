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
import type { BillingDashboardData, BillingLedgerRow, BillingStatus } from '@/lib/billing/types';

type DashboardResponse = BillingDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type Props = {
  initialData: DashboardResponse;
  viewerName: string | null;
};

const currency = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Não foi possível sincronizar a faturação.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    const message = (payload as any)?.message ?? 'Não foi possível sincronizar a faturação.';
    throw new Error(message);
  }
  return payload as DashboardResponse;
};

function formatCurrency(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '—';
  return currency.format(value);
}

function formatTooltipDate(label: string): string {
  try {
    return dateFormatter.format(new Date(label));
  } catch (error) {
    console.warn('billing-dashboard.tooltip-date', error);
    return label;
  }
}

function matchesQuery(row: BillingLedgerRow, query: string): boolean {
  if (!query) return true;
  const normalized = query.toLowerCase();
  const haystack = [
    row.clientName.toLowerCase(),
    row.serviceName.toLowerCase(),
    row.statusLabel.toLowerCase(),
    row.methodLabel.toLowerCase(),
    row.reference?.toLowerCase() ?? '',
    row.notes?.toLowerCase() ?? '',
  ];
  return haystack.some((value) => value.includes(normalized));
}

function exportLedger(rows: BillingLedgerRow[]) {
  const header = [
    'ID',
    'Cliente',
    'Serviço',
    'Emitida em',
    'Vencimento',
    'Estado',
    'Método',
    'Montante',
    'Referência',
    'Notas',
  ];
  const body = rows.map((row) => [
    row.id,
    row.clientName,
    row.serviceName,
    row.issuedLabel,
    row.dueLabel,
    row.statusLabel,
    row.methodLabel,
    row.amountLabel,
    row.reference ?? '',
    row.notes ?? '',
  ]);
  const csv = [header, ...body]
    .map((cols) =>
      cols.map((value) => (value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value)).join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `faturacao-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

const STATUS_ORDER: BillingStatus[] = ['paid', 'pending', 'refunded'];

export default function BillingClient({ initialData, viewerName }: Props) {
  const { data, error, isLoading } = useSWR<DashboardResponse>('/api/billing/dashboard', fetcher, {
    fallbackData: initialData,
    revalidateOnMount: true,
  });

  const dashboard = data ?? initialData;
  const [statusFilter, setStatusFilter] = React.useState<'all' | BillingStatus>('all');
  const [query, setQuery] = React.useState('');

  const ledger = React.useMemo(() => {
    const baseRows = statusFilter === 'all'
      ? dashboard.ledger
      : dashboard.ledger.filter((row) => row.status === statusFilter);
    const filtered = query.trim() ? baseRows.filter((row) => matchesQuery(row, query)) : baseRows;
    return filtered;
  }, [dashboard.ledger, query, statusFilter]);

  const statusSummary = React.useMemo(() => {
    const map = new Map<'all' | BillingStatus, number>();
    dashboard.statuses.forEach((entry) => {
      map.set(entry.id, entry.count);
    });
    return map;
  }, [dashboard.statuses]);

  const heroMetrics = React.useMemo(
    () => [
      {
        id: 'volume',
        label: 'Volume total',
        value: formatCurrency(dashboard.totals.volume),
        tone: 'primary' as const,
        helper: `${dashboard.range.invoiceCount} lançamentos`,
      },
      {
        id: 'outstanding',
        label: 'Por receber',
        value: formatCurrency(dashboard.totals.outstanding),
        tone: 'warning' as const,
        helper: `${statusSummary.get('pending') ?? 0} pendentes activos`,
      },
      {
        id: 'refunded',
        label: 'Reembolsado',
        value: formatCurrency(dashboard.totals.refunded),
        tone: 'pink' as const,
        helper: `${dashboard.totals.refundedCount} ocorrências`,
      },
      {
        id: 'average',
        label: 'Ticket médio',
        value: formatCurrency(dashboard.totals.average),
        tone: 'teal' as const,
        helper: `Período ${dashboard.range.label.toLowerCase()}`,
      },
    ],
    [dashboard.range.invoiceCount, dashboard.range.label, dashboard.totals, statusSummary],
  );

  const timelineData = React.useMemo(() => {
    return dashboard.timeline.map((point) => ({
      ...point,
      label: formatTooltipDate(point.date),
    }));
  }, [dashboard.timeline]);

  const hasTimeline = timelineData.length > 0;

  const nextDue = dashboard.nextDue;

  const sourceLabel = dashboard.source === 'supabase' ? 'Supabase (tempo real)' : 'Dataset offline';

  const lastUpdatedLabel = React.useMemo(() => {
    try {
      return dateTimeFormatter.format(new Date(dashboard.generatedAt));
    } catch (err) {
      console.warn('billing-dashboard.generatedAt', err);
      return dashboard.generatedAt;
    }
  }, [dashboard.generatedAt]);

  const sortedStatuses = React.useMemo(
    () =>
      dashboard.statuses
        .slice()
        .sort((a, b) => {
          const aIndex = STATUS_ORDER.indexOf(a.id as BillingStatus);
          const bIndex = STATUS_ORDER.indexOf(b.id as BillingStatus);
          return aIndex - bIndex;
        }),
    [dashboard.statuses],
  );

  return (
    <div className="client-billing" data-loading={isLoading}>
      <PageHeader
        title="Faturação"
        subtitle={
          viewerName
            ? `Olá ${viewerName.split(' ')[0]}, aqui tens o resumo da tua faturação e pagamentos recentes.`
            : 'Monitoriza o ritmo de faturação, identifica pendentes críticos e exporta relatórios para a tua equipa.'
        }
        actions={
          <Button type="button" variant="primary" onClick={() => exportLedger(dashboard.ledger)}>
            Exportar CSV
          </Button>
        }
        sticky={false}
      />

      <section className="neo-panel client-billing__panel" aria-labelledby="billing-hero-heading">
        <header className="client-billing__sectionHeader">
          <div className="client-billing__sectionMeta">
            <span className="caps-tag">Resumo financeiro</span>
            <h2 id="billing-hero-heading" className="neo-panel__title">
              Ritmo actual de faturação
            </h2>
            <p className="neo-panel__subtitle">{dashboard.range.label}</p>
          </div>
          <span className="status-pill" data-state={dashboard.source === 'supabase' ? 'ok' : 'warn'}>
            {sourceLabel}
          </span>
        </header>

        <div className="client-billing__metrics">
          {heroMetrics.map((metric) => (
            <article key={metric.id} className="neo-surface client-billing__metric" data-variant={metric.tone}>
              <span className="neo-surface__hint">{metric.label}</span>
              <span className="neo-surface__value">{metric.value}</span>
              <p className="neo-surface__meta">{metric.helper}</p>
            </article>
          ))}
        </div>

        {nextDue && (
          <div className="client-billing__nextDue" role="status">
            <span className="client-billing__nextDueHint">Próximo vencimento</span>
            <div className="client-billing__nextDueMeta">
              <strong>{nextDue.serviceName}</strong>
              <span>{dateFormatter.format(new Date(nextDue.dueAt))}</span>
            </div>
            <span className="client-billing__nextDueValue">{formatCurrency(nextDue.amount)}</span>
          </div>
        )}
      </section>

      <section className="neo-panel client-billing__panel" aria-labelledby="billing-timeline-heading">
        <header className="client-billing__sectionHeader">
          <div className="client-billing__sectionMeta">
            <h2 id="billing-timeline-heading" className="neo-panel__title">
              Evolução semanal
            </h2>
            <p className="neo-panel__subtitle">Volume recebido vs. pendente por data de emissão.</p>
          </div>
          <span className="client-billing__updatedAt">Actualizado {lastUpdatedLabel}</span>
        </header>

        <div className="client-billing__chart" role="region" aria-live="polite">
          {hasTimeline ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timelineData} margin={{ left: 0, top: 10, right: 16, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={formatCurrency} width={90} />
                <Tooltip
                  formatter={(value: number, key: string) => [
                    formatCurrency(value),
                    key === 'paidVolume' ? 'Recebido' : key === 'pendingVolume' ? 'Pendente' : 'Reembolsado',
                  ]}
                  labelFormatter={(label) => formatTooltipDate(label)}
                />
                <Area type="monotone" dataKey="paidVolume" stackId="1" stroke="#2563eb" fill="var(--neo-chart-primary)" />
                <Area type="monotone" dataKey="pendingVolume" stackId="1" stroke="#f97316" fill="var(--neo-chart-warning)" />
                <Area type="monotone" dataKey="refundedVolume" stroke="#ec4899" fill="var(--neo-chart-pink)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="neo-empty client-billing__empty">
              <span className="neo-empty__icon" aria-hidden="true">📉</span>
              <p className="neo-empty__title">Sem dados suficientes</p>
              <p className="neo-empty__description">
                Assim que tiveres histórico de faturação iremos desenhar a evolução automaticamente.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="neo-panel client-billing__panel" aria-labelledby="billing-methods-heading">
        <header className="client-billing__sectionHeader">
          <div className="client-billing__sectionMeta">
            <h2 id="billing-methods-heading" className="neo-panel__title">
              Métodos de pagamento
            </h2>
            <p className="neo-panel__subtitle">Distribuição por volume dos últimos lançamentos.</p>
          </div>
        </header>
        <ul className="client-billing__methods">
          {dashboard.methods.map((method) => (
            <li key={method.method} className="client-billing__methodRow">
              <div>
                <strong>{method.label}</strong>
                <span>{method.count} lançamentos</span>
              </div>
              <span>{formatCurrency(method.volume)}</span>
              <div className="client-billing__methodBar" aria-hidden="true">
                <span style={{ width: `${Math.min(100, Math.round(method.share * 100))}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="neo-panel client-billing__panel" aria-labelledby="billing-highlights-heading">
        <header className="client-billing__sectionHeader">
          <div className="client-billing__sectionMeta">
            <h2 id="billing-highlights-heading" className="neo-panel__title">
              Destaques operacionais
            </h2>
            <p className="neo-panel__subtitle">Acompanha pendentes críticos e eventos financeiros relevantes.</p>
          </div>
        </header>
        <div className="client-billing__highlights">
          {dashboard.highlights.map((highlight) => (
            <article key={highlight.id} className="neo-surface client-billing__highlight" data-variant={highlight.tone}>
              <span className="neo-surface__hint">{highlight.title}</span>
              <span className="neo-surface__value">{highlight.value}</span>
              <p className="neo-surface__meta">{highlight.description}</p>
              {highlight.meta && <span className="neo-surface__meta client-billing__highlightMeta">{highlight.meta}</span>}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel client-billing__panel" aria-labelledby="billing-ledger-heading">
        <header className="client-billing__sectionHeader">
          <div className="client-billing__sectionMeta">
            <h2 id="billing-ledger-heading" className="neo-panel__title">
              Livro de faturação
            </h2>
            <p className="neo-panel__subtitle">Filtra e exporta os lançamentos financeiros rapidamente.</p>
          </div>
          <div className="neo-segmented" role="tablist" aria-label="Filtrar por estado">
            {sortedStatuses.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="neo-segmented__btn"
                data-active={statusFilter === entry.id}
                aria-pressed={statusFilter === entry.id}
                onClick={() => setStatusFilter(entry.id as 'all' | BillingStatus)}
              >
                <span>{entry.label}</span>
                <span className="neo-segmented__count">{entry.count}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="client-billing__filters">
          <label className="neo-input-group__field client-billing__search">
            <span className="neo-input-group__label">Pesquisar</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cliente, serviço, referência…"
              className="neo-input"
              aria-label="Pesquisar lançamentos"
            />
          </label>
          <div className="client-billing__resultCount">
            {ledger.length} lançamento{ledger.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          {ledger.length === 0 ? (
            <div className="neo-empty client-billing__empty">
              <span className="neo-empty__icon" aria-hidden="true">🪐</span>
              <p className="neo-empty__title">Sem lançamentos para mostrar</p>
              <p className="neo-empty__description">
                Ajusta os filtros ou sincroniza novos pagamentos para veres o histórico aqui.
              </p>
              {(statusFilter !== 'all' || query.trim().length > 0) && (
                <Button type="button" variant="ghost" onClick={() => setQuery('')}>
                  Limpar pesquisa
                </Button>
              )}
            </div>
          ) : (
            <table className="neo-table client-billing__table">
              <thead>
                <tr>
                  <th scope="col">Cliente</th>
                  <th scope="col">Serviço</th>
                  <th scope="col">Emitida</th>
                  <th scope="col">Vencimento</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Método</th>
                  <th scope="col">Montante</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="client-billing__tableClient">
                        <strong>{row.clientName}</strong>
                        {row.reference && <span>{row.reference}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="client-billing__tableService">
                        <span>{row.serviceName}</span>
                        {row.notes && <small>{row.notes}</small>}
                      </div>
                    </td>
                    <td>{row.issuedLabel}</td>
                    <td>{row.dueLabel}</td>
                    <td>
                      <span className="neo-table__status" data-state={row.status}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td>{row.methodLabel}</td>
                    <td>{row.amountLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {error && (
        <div className="client-billing__error" role="alert">
          <strong>Erro ao actualizar a faturação.</strong>
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}

