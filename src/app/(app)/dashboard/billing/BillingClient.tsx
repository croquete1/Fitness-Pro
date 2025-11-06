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
import { AlertTriangle, CalendarDays, Download, Filter, RefreshCcw, Search, Wallet } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
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

const RELATIVE = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

function formatRelativeDays(target: string | null): string | null {
  if (!target) return null;
  const parsed = new Date(target);
  if (!Number.isFinite(parsed.getTime())) return null;
  const diffMs = parsed.getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);
  if (diffDays === 0) return 'hoje';
  return RELATIVE.format(diffDays, 'day');
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

type HeroMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'warning' | 'teal' | 'pink' | 'neutral';
};

export default function BillingClient({ initialData, viewerName }: Props) {
  const { data, error, isLoading } = useSWR<DashboardResponse>('/api/billing/dashboard', fetcher, {
    fallbackData: initialData,
    revalidateOnMount: true,
  });

  const dashboard = data ?? initialData;
  const [statusFilter, setStatusFilter] = React.useState<'all' | BillingStatus>('all');
  const [query, setQuery] = React.useState('');
  const queryInputId = React.useId();

  const overdueInvoices = React.useMemo(() => {
    const now = Date.now();
    return dashboard.ledger.filter((row) => {
      if (row.status !== 'pending' || !row.dueAt) return false;
      const dueDate = new Date(row.dueAt);
      return Number.isFinite(dueDate.getTime()) && dueDate.getTime() < now;
    });
  }, [dashboard.ledger]);

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

  const heroMetrics = React.useMemo<HeroMetric[]>(() => {
    const paid = statusSummary.get('paid') ?? 0;
    const total = statusSummary.get('all') ?? dashboard.range.invoiceCount;
    const conversion = total > 0 ? Math.round((paid / total) * 100) : 0;

    return [
      {
        id: 'volume',
        label: 'Volume total',
        value: formatCurrency(dashboard.totals.volume),
        tone: 'primary',
        helper: `${dashboard.range.invoiceCount} lançamento${dashboard.range.invoiceCount === 1 ? '' : 's'}`,
      },
      {
        id: 'outstanding',
        label: 'Por receber',
        value: formatCurrency(dashboard.totals.outstanding),
        tone: 'warning',
        helper: `${statusSummary.get('pending') ?? 0} pendentes (${overdueInvoices.length} vencidos)`,
      },
      {
        id: 'refunded',
        label: 'Reembolsado',
        value: formatCurrency(dashboard.totals.refunded),
        tone: 'pink',
        helper: `${dashboard.totals.refundedCount} ocorrência${dashboard.totals.refundedCount === 1 ? '' : 's'}`,
      },
      {
        id: 'conversion',
        label: 'Taxa de cobrança',
        value: `${conversion}%`,
        tone: 'teal',
        helper: `Base de ${total} lançamento${total === 1 ? '' : 's'}`,
      },
    ];
  }, [dashboard.range.invoiceCount, dashboard.totals, overdueInvoices.length, statusSummary]);

  const timelineData = React.useMemo(() => {
    return dashboard.timeline.map((point) => ({
      ...point,
      label: formatTooltipDate(point.date),
    }));
  }, [dashboard.timeline]);

  const hasTimeline = timelineData.length > 0;

  const nextDue = dashboard.nextDue;

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

  const handleExport = React.useCallback(() => {
    if (!dashboard.ledger.length) return;
    exportLedger(dashboard.ledger);
  }, [dashboard.ledger]);

  const overdueRelative = nextDue ? formatRelativeDays(nextDue.dueAt) : null;
  const isFallback = dashboard.source === 'fallback';
  const emptyLedger = dashboard.ledger.length === 0;

  return (
    <div className="client-page">
      <div className="billing-dashboard" data-loading={isLoading}>
      <PageHeader
        title="Faturação"
        subtitle={
          viewerName
            ? `Olá ${viewerName.split(' ')[0]}, acompanha aqui o estado financeiro real das tuas vendas.`
            : 'Monitoriza a facturação, identifica riscos de cobrança e exporta relatórios com um clique.'
        }
        actions={
          <Button
            type="button"
            variant="primary"
            onClick={handleExport}
            leftIcon={<Download size={16} />}
            disabled={emptyLedger}
            title={emptyLedger ? 'Sem lançamentos para exportar' : undefined}
          >
            Exportar CSV
          </Button>
        }
        sticky={false}
      />

      <div className="billing-dashboard__metaBar" role="status">
        <div className="billing-dashboard__metaItem">
          <Wallet size={16} aria-hidden />
          <span>{dashboard.range.label}</span>
        </div>
        <div className="billing-dashboard__metaItem">
          <RefreshCcw size={16} aria-hidden />
          <span>Actualizado {lastUpdatedLabel}</span>
        </div>
        <DataSourceBadge source={dashboard.source} generatedAt={dashboard.generatedAt} />
      </div>

      {isFallback ? (
        <Alert
          tone="warning"
          className="billing-dashboard__alert"
          role="status"
          title="Modo offline"
        >
          Não foi possível ligar ao servidor. Alguns blocos podem não mostrar dados actualizados.
        </Alert>
      ) : null}

      <section className="neo-panel billing-dashboard__panel" aria-labelledby="billing-hero-heading">
        <header className="billing-dashboard__sectionHeader">
          <div>
            <span className="billing-dashboard__sectionHint">Resumo financeiro</span>
            <h2 id="billing-hero-heading" className="billing-dashboard__sectionTitle">
              Performance da facturação
            </h2>
          </div>
          {overdueInvoices.length > 0 && (
            <span className="billing-dashboard__tag" data-variant="warning">
              {overdueInvoices.length} vencido{overdueInvoices.length === 1 ? '' : 's'} a atenção
            </span>
          )}
        </header>

        <div className="billing-dashboard__hero" role="list">
          {heroMetrics.map((metric) => (
            <article key={metric.id} className="billing-dashboard__heroCard" data-tone={metric.tone} role="listitem">
              <span className="billing-dashboard__heroLabel">{metric.label}</span>
              <strong className="billing-dashboard__heroValue">{metric.value}</strong>
              <span className="billing-dashboard__heroHelper">{metric.helper}</span>
            </article>
          ))}
        </div>

        {nextDue && (
          <div className="billing-dashboard__nextDue" role="status">
            <div className="billing-dashboard__nextDueIcon" aria-hidden>
              <CalendarDays size={18} />
            </div>
            <div className="billing-dashboard__nextDueMeta">
              <span className="billing-dashboard__nextDueHint">Próximo vencimento</span>
              <strong>{nextDue.serviceName}</strong>
              <span>{nextDue.clientName}</span>
            </div>
            <div className="billing-dashboard__nextDueInfo">
              <span>{formatCurrency(nextDue.amount)}</span>
              {overdueRelative ? <small>{overdueRelative}</small> : null}
            </div>
          </div>
        )}
      </section>

      <section className="neo-panel billing-dashboard__panel" aria-labelledby="billing-timeline-heading">
        <header className="billing-dashboard__sectionHeader">
          <div>
            <span className="billing-dashboard__sectionHint">Histórico</span>
            <h2 id="billing-timeline-heading" className="billing-dashboard__sectionTitle">
              Volume por data de emissão
            </h2>
            <p className="billing-dashboard__sectionSubtitle">
              Compara valores recebidos, pendentes e reembolsados para antecipar fluxos de caixa.
            </p>
          </div>
        </header>
        <div className="billing-dashboard__chart" role="region" aria-live="polite">
          {hasTimeline ? (
            <ResponsiveContainer width="100%" height={280}>
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
            <div className="billing-dashboard__empty" role="status">
              <span className="billing-dashboard__emptyIcon" aria-hidden>
                <AlertTriangle size={18} />
              </span>
              <p className="billing-dashboard__emptyTitle">Sem dados suficientes</p>
              <p className="billing-dashboard__emptyDescription">
                Assim que houver histórico de faturação iremos mostrar a evolução automaticamente.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="neo-panel billing-dashboard__panel" aria-labelledby="billing-methods-heading">
        <header className="billing-dashboard__sectionHeader">
          <div>
            <span className="billing-dashboard__sectionHint">Pagamentos</span>
            <h2 id="billing-methods-heading" className="billing-dashboard__sectionTitle">
              Métodos preferidos dos clientes
            </h2>
          </div>
        </header>
        <ul className="billing-dashboard__methods">
          {dashboard.methods.map((method) => (
            <li key={method.method} className="billing-dashboard__methodRow">
              <div>
                <strong>{method.label}</strong>
                <span>{method.count} lançamento{method.count === 1 ? '' : 's'}</span>
              </div>
              <div className="billing-dashboard__methodInfo">
                <span>{formatCurrency(method.volume)}</span>
                <span>{Math.round(method.share * 100)}%</span>
              </div>
              <div className="billing-dashboard__methodBar" aria-hidden="true">
                <span style={{ width: `${Math.min(100, Math.round(method.share * 100))}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="neo-panel billing-dashboard__panel" aria-labelledby="billing-highlights-heading">
        <header className="billing-dashboard__sectionHeader">
          <div>
            <span className="billing-dashboard__sectionHint">Insights automáticos</span>
            <h2 id="billing-highlights-heading" className="billing-dashboard__sectionTitle">
              Alertas de fluxo de caixa
            </h2>
          </div>
        </header>
        <div className="billing-dashboard__highlights" role="list">
          {dashboard.highlights.map((highlight) => (
            <article
              key={highlight.id}
              className="billing-dashboard__highlight"
              data-tone={highlight.tone}
              role="listitem"
            >
              <span className="billing-dashboard__highlightLabel">{highlight.title}</span>
              <strong className="billing-dashboard__highlightValue">{highlight.value}</strong>
              <p className="billing-dashboard__highlightDescription">{highlight.description}</p>
              {highlight.meta ? <span className="billing-dashboard__highlightMeta">{highlight.meta}</span> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel billing-dashboard__panel" aria-labelledby="billing-ledger-heading">
        <header className="billing-dashboard__sectionHeader billing-dashboard__sectionHeader--stack">
          <div>
            <span className="billing-dashboard__sectionHint">Livro de faturação</span>
            <h2 id="billing-ledger-heading" className="billing-dashboard__sectionTitle">
              Movimentos detalhados
            </h2>
            <p className="billing-dashboard__sectionSubtitle">
              Filtra, prioriza e exporta os lançamentos financeiros em segundos.
            </p>
          </div>
          <div className="billing-dashboard__filters">
            <div className="neo-segmented billing-dashboard__statusFilter" role="tablist" aria-label="Filtrar por estado">
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
            <label htmlFor={queryInputId} className="billing-dashboard__search">
              <Search size={16} aria-hidden className="billing-dashboard__searchIcon" />
              <span className="sr-only">Pesquisar lançamentos</span>
              <input
                id={queryInputId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cliente, serviço, referência…"
                className="neo-input"
              />
            </label>
            <span className="billing-dashboard__filtersCount">
              {ledger.length} lançamento{ledger.length === 1 ? '' : 's'}
            </span>
          </div>
        </header>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          {ledger.length === 0 ? (
            <div className="billing-dashboard__empty" role="status">
              <span className="billing-dashboard__emptyIcon" aria-hidden>
                <Filter size={18} />
              </span>
              <p className="billing-dashboard__emptyTitle">Sem lançamentos para mostrar</p>
              <p className="billing-dashboard__emptyDescription">
                Ajusta os filtros ou sincroniza novos pagamentos para veres o histórico aqui.
              </p>
              {(statusFilter !== 'all' || query.trim().length > 0) && (
                <Button type="button" variant="ghost" onClick={() => setQuery('')}>
                  Limpar pesquisa
                </Button>
              )}
            </div>
          ) : (
            <table className="neo-table billing-dashboard__table">
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
                      <div className="billing-dashboard__tableClient">
                        <strong>{row.clientName}</strong>
                        {row.reference ? <span>{row.reference}</span> : null}
                      </div>
                    </td>
                    <td>
                      <div className="billing-dashboard__tableService">
                        <span>{row.serviceName}</span>
                        {row.notes ? <small>{row.notes}</small> : null}
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

      {error ? (
        <Alert tone="danger" className="billing-dashboard__alert" role="alert" title="Erro ao actualizar a faturação">
          {error.message}
        </Alert>
      ) : null}
      </div>
    </div>
  );
}

