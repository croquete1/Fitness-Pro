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
  ClientWalletDashboardResponse,
  ClientWalletEntryView,
  ClientWalletHighlight,
  ClientWalletHeroMetric,
  ClientWalletTimelinePoint,
} from '@/lib/client/wallet/types';

type Props = {
  initialData: ClientWalletDashboardResponse;
  initialRange: number;
};

type FilterValue = 'all' | 'credit' | 'debit';

type DashboardResponse = ClientWalletDashboardResponse;

const rangeOptions = [
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
];

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível sincronizar a carteira.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    const message = (payload as any)?.message ?? 'Não foi possível sincronizar a carteira.';
    throw new Error(message);
  }
  return payload as DashboardResponse;
};

const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const tooltipFormatter = (value: number, name: string) => {
  if (name === 'Saldo') return currencyFormatter.format(value);
  return currencyFormatter.format(Math.abs(value));
};

function formatRangeLabel(range: { label: string; start: string; end: string }) {
  try {
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    return `${dateFormatter.format(startDate)} – ${dateFormatter.format(endDate)}`;
  } catch (error) {
    console.warn('[client-wallet] invalid range label', error);
    return range.label;
  }
}

function matchesQuery(entry: ClientWalletEntryView, query: string): boolean {
  if (!query) return true;
  const haystack = [entry.description ?? '', entry.amountLabel, entry.timeLabel];
  const target = query.toLowerCase();
  return haystack.some((value) => value.toLowerCase().includes(target));
}

function exportEntries(entries: ClientWalletEntryView[]) {
  const rows = entries.map((entry) => [
    entry.id,
    entry.timeLabel,
    entry.relative,
    entry.description ?? '',
    entry.type === 'credit' ? 'Carregamento' : 'Débito',
    entry.amountLabel,
    entry.balanceLabel,
  ]);
  const header = ['ID', 'Data', 'Quando', 'Descrição', 'Tipo', 'Montante', 'Saldo após'];
  const csv = [header, ...rows]
    .map((cols) => cols.map((value) => (value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value)).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `carteira-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function HeroMetrics({ metrics }: { metrics: ClientWalletHeroMetric[] }) {
  if (!metrics.length) return null;
  return (
    <div className="client-wallet-dashboard__hero" role="list">
      {metrics.map((metric) => (
        <article
          key={metric.id}
          role="listitem"
          className="client-wallet-dashboard__heroCard"
          data-tone={metric.tone ?? 'neutral'}
        >
          <span className="client-wallet-dashboard__heroLabel">{metric.label}</span>
          <strong className="client-wallet-dashboard__heroValue">{metric.value}</strong>
          {metric.hint ? <span className="client-wallet-dashboard__heroHint">{metric.hint}</span> : null}
          {metric.trend ? <span className="client-wallet-dashboard__heroTrend">{metric.trend}</span> : null}
        </article>
      ))}
    </div>
  );
}

function Highlights({ highlights }: { highlights: ClientWalletHighlight[] }) {
  if (!highlights.length) {
    return (
      <div className="client-wallet-dashboard__highlightEmpty">
        <span className="neo-text--muted">Sem destaques para este período.</span>
      </div>
    );
  }
  return (
    <div className="client-wallet-dashboard__highlights" role="list">
      {highlights.map((highlight) => (
        <article
          key={highlight.id}
          role="listitem"
          className="client-wallet-dashboard__highlight"
          data-tone={highlight.tone}
        >
          <div className="client-wallet-dashboard__highlightBody">
            <h3>{highlight.title}</h3>
            <p>{highlight.description}</p>
            {highlight.meta ? <span className="client-wallet-dashboard__highlightMeta">{highlight.meta}</span> : null}
          </div>
          {highlight.icon ? <span className="client-wallet-dashboard__highlightIcon" aria-hidden>{highlight.icon}</span> : null}
        </article>
      ))}
    </div>
  );
}

function TimelineChart({ timeline }: { timeline: ClientWalletTimelinePoint[] }) {
  if (!timeline.length) {
    return (
      <div className="client-wallet-dashboard__chartEmpty" role="status">
        <span className="neo-text--muted">Sem movimentos registados para gerar o gráfico.</span>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={timeline} margin={{ top: 12, right: 24, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
        <YAxis
          tickFormatter={(value) => currencyFormatter.format(value)}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={(label) => label}
          contentStyle={{ backgroundColor: 'var(--neo-surface-elevated)', borderRadius: 8 }}
        />
        <Area type="monotone" dataKey="balance" name="Saldo" stroke="#2563eb" fill="rgba(37,99,235,0.12)" strokeWidth={2} />
        <Area type="monotone" dataKey="credit" name="Carregamentos" stroke="#22c55e" fill="rgba(34,197,94,0.18)" />
        <Area type="monotone" dataKey="debit" name="Débitos" stroke="#ef4444" fill="rgba(239,68,68,0.16)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function ClientWalletClient({ initialData, initialRange }: Props) {
  const [range, setRange] = React.useState(initialRange);
  const [filter, setFilter] = React.useState<FilterValue>('all');
  const [query, setQuery] = React.useState('');

  const key = React.useMemo(() => `/api/client/wallet/dashboard?range=${range}`, [range]);
  const { data, error, isValidating, mutate } = useSWR<DashboardResponse>(key, fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const dashboard = data ?? initialData;

  const entries = React.useMemo(() => {
    const filtered = dashboard.entries.filter((entry) => {
      if (filter !== 'all' && entry.type !== filter) return false;
      return matchesQuery(entry, query.trim());
    });
    return filtered;
  }, [dashboard.entries, filter, query]);

  const creditTotal = entries
    .filter((entry) => entry.type === 'credit')
    .reduce((total, entry) => total + entry.amount, 0);
  const debitTotal = entries
    .filter((entry) => entry.type === 'debit')
    .reduce((total, entry) => total + Math.abs(entry.amount), 0);

  const rangeLabel = React.useMemo(() => formatRangeLabel(dashboard.range), [dashboard.range]);

  const handleRangeChange = (value: number) => {
    setRange(value);
    void mutate();
  };

  return (
    <div className="client-wallet-dashboard neo-stack neo-stack--xl">
      <PageHeader
        title="Carteira"
        subtitle="Saldo disponível, carregamentos e utilização recente."
        actions={
          <div className="neo-inline neo-inline--sm">
            <div className="client-wallet-dashboard__rangePicker" role="group" aria-label="Intervalo temporal">
              {rangeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="neo-toggle-chip"
                  data-state={range === option.value ? 'on' : 'off'}
                  onClick={() => handleRangeChange(option.value)}
                  disabled={isValidating && range === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" loading={isValidating} onClick={() => mutate()}>
              {isValidating ? 'A actualizar…' : 'Actualizar'}
            </Button>
          </div>
        }
      />

      {error ? (
        <Alert tone="danger" title="Não foi possível actualizar a carteira.">
          {error.message}
        </Alert>
      ) : null}

      {dashboard.source === 'fallback' ? (
        <Alert tone="warning" title="A mostrar dados de referência.">
          Não foi possível ligar ao Supabase — a apresentar os últimos dados em cache.
        </Alert>
      ) : null}

      <section className="neo-panel neo-stack neo-stack--lg client-wallet-dashboard__summary" aria-labelledby="wallet-hero">
        <div className="client-wallet-dashboard__summaryHeader">
          <div className="neo-stack neo-stack--xs">
            <span className="caps-tag">Saldo disponível</span>
            <h2 id="wallet-hero" className="heading-solid">
              {dashboard.balance.label}
            </h2>
            <p className="neo-text--muted">
              {dashboard.balance.updatedRelative
                ? `Actualizado ${dashboard.balance.updatedRelative}`
                : 'Sem actualizações recentes'}
            </p>
          </div>
          <div className="client-wallet-dashboard__summaryMeta">
            <span>{rangeLabel}</span>
            <span>{dashboard.totals.entriesCount} movimento(s)</span>
          </div>
        </div>
        <HeroMetrics metrics={dashboard.hero} />
      </section>

      <section className="neo-panel neo-stack neo-stack--lg client-wallet-dashboard__analytics">
        <header className="client-wallet-dashboard__analyticsHeader">
          <div className="neo-stack neo-stack--xs">
            <h2 className="neo-panel__title">Movimentos e saldo</h2>
            <p className="neo-panel__subtitle">
              Evolução diária da carteira com detalhe de carregamentos e débitos.
            </p>
          </div>
          <div className="client-wallet-dashboard__analyticsTotals">
            <div>
              <span className="neo-surface__hint">Carregamentos</span>
              <strong>{currencyFormatter.format(creditTotal)}</strong>
            </div>
            <div>
              <span className="neo-surface__hint">Débitos</span>
              <strong>{currencyFormatter.format(debitTotal)}</strong>
            </div>
          </div>
        </header>
        <TimelineChart timeline={dashboard.timeline} />
      </section>

      <section className="neo-panel neo-stack neo-stack--lg client-wallet-dashboard__highlightsPanel">
        <header className="client-wallet-dashboard__highlightsHeader">
          <div className="neo-stack neo-stack--xs">
            <h2 className="neo-panel__title">Destaques</h2>
            <p className="neo-panel__subtitle">Alertas rápidos com base nas últimas movimentações.</p>
          </div>
        </header>
        <Highlights highlights={dashboard.highlights} />
      </section>

      <section className="neo-panel neo-stack neo-stack--lg client-wallet-dashboard__entriesPanel">
        <header className="client-wallet-dashboard__entriesHeader">
          <div className="neo-stack neo-stack--xs">
            <h2 className="neo-panel__title">Movimentos detalhados</h2>
            <p className="neo-panel__subtitle">Lista completa com pesquisa, filtros e exportação CSV.</p>
          </div>
          <div className="client-wallet-dashboard__entriesActions">
            <div className="client-wallet-dashboard__filterGroup" role="group" aria-label="Filtrar tipo">
              {(['all', 'credit', 'debit'] as FilterValue[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="neo-toggle-chip"
                  data-state={filter === value ? 'on' : 'off'}
                  onClick={() => setFilter(value)}
                >
                  {value === 'all' ? 'Todos' : value === 'credit' ? 'Carregamentos' : 'Débitos'}
                </button>
              ))}
            </div>
            <input
              type="search"
              className="neo-input client-wallet-dashboard__search"
              placeholder="Pesquisar descrição, montante ou data"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button variant="secondary" size="sm" onClick={() => exportEntries(entries)} disabled={!entries.length}>
              Exportar CSV
            </Button>
          </div>
        </header>
        <div className="client-wallet-dashboard__tableWrapper">
          <table className="neo-table client-wallet-dashboard__table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Montante</th>
                <th>Saldo após</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className="client-wallet-dashboard__tableDate">
                      <strong>{entry.timeLabel}</strong>
                      <span>{entry.relative}</span>
                    </div>
                  </td>
                  <td>{entry.description ?? '—'}</td>
                  <td>
                    <span className="client-wallet-dashboard__badge" data-tone={entry.type}>
                      {entry.type === 'credit' ? 'Carregamento' : 'Débito'}
                    </span>
                  </td>
                  <td className="client-wallet-dashboard__amount" data-tone={entry.type}>
                    {entry.amountLabel}
                  </td>
                  <td>{entry.balanceLabel}</td>
                </tr>
              ))}
              {!entries.length && (
                <tr>
                  <td colSpan={5}>
                    <div className="neo-empty client-wallet-dashboard__empty">
                      <span className="neo-empty__icon" aria-hidden>
                        💳
                      </span>
                      <p className="neo-empty__title">Sem movimentos</p>
                      <p className="neo-empty__description">
                        Ajuste os filtros ou aguarde por novos carregamentos e débitos.
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
  );
}
