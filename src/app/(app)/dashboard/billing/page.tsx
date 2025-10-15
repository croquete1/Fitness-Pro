'use client';

import { useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';

const currency = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

type BillingStatus = 'paid' | 'pending' | 'refunded';

type BillingItem = {
  id: string;
  client: string;
  service: string;
  issuedAt: string;
  amount: number;
  status: BillingStatus;
  method: 'mbway' | 'visa' | 'transfer';
};

const STATUS_SEGMENTS: Array<{ id: 'all' | BillingStatus; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'paid', label: 'Recebidos' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'refunded', label: 'Reembolsos' },
];

const METHOD_LABEL: Record<BillingItem['method'], string> = {
  mbway: 'MB Way',
  visa: 'Visa',
  transfer: 'Transferência',
};

const EMPTY_ITEMS: BillingItem[] = [];

export default function BillingPage() {
  const [items] = useState<BillingItem[]>(EMPTY_ITEMS);
  const [segment, setSegment] = useState<(typeof STATUS_SEGMENTS)[number]['id']>('all');
  const [query, setQuery] = useState('');

  const statusCounts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.all += 1;
        acc[item.status] += 1;
        return acc;
      },
      { all: 0, paid: 0, pending: 0, refunded: 0 } as Record<'all' | BillingStatus, number>,
    );
  }, [items]);

  const filteredBySegment = useMemo(() => {
    if (segment === 'all') return items;
    return items.filter((item) => item.status === segment);
  }, [items, segment]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredBySegment;
    return filteredBySegment.filter((item) =>
      [item.client, item.service, item.method, item.status]
        .map((v) => String(v).toLowerCase())
        .some((value) => value.includes(q)),
    );
  }, [filteredBySegment, query]);

  const metrics = useMemo(() => {
    const usingFilters = segment !== 'all' || query.trim().length > 0;
    const base = usingFilters ? filtered : items;
    const totals = base.reduce(
      (acc, item) => {
        acc.volume += item.amount;
        if (item.status === 'pending') acc.outstanding += item.amount;
        if (item.status === 'refunded') acc.refunded += item.amount;
        return acc;
      },
      { volume: 0, outstanding: 0, refunded: 0 },
    );

    const average = base.length ? totals.volume / base.length : 0;

    return {
      total: totals.volume,
      outstanding: totals.outstanding,
      refunded: totals.refunded,
      average,
      source: usingFilters ? 'filtros activos' : 'total',
    };
  }, [filtered, items, query, segment]);

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 lg:px-12">
      <PageHeader
        title="Faturação"
        subtitle="Monitoriza os fluxos de receita em tempo real, identifica pendentes e exporta rapidamente relatórios para a tua equipa financeira."
        actions={
          <button type="button" className="btn primary" disabled>
            Exportar CSV
          </button>
        }
      />

      <section className="neo-panel space-y-5" aria-labelledby="billing-metrics-heading">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="caps-tag">Resumo financeiro</span>
            <h2 id="billing-metrics-heading" className="neo-panel__title">
              Ritmo actual de faturação
            </h2>
            <p className="neo-panel__subtitle">
              Totais actualizados com base nos filtros activos, prontos para comparar com metas semanais.
            </p>
          </div>
          <span className="neo-surface__meta">{metrics.source}</span>
        </div>

        <div className="neo-grid auto-fit min-[220px]:grid-cols-2 lg:grid-cols-4">
          <article className="neo-surface neo-surface--interactive space-y-2 p-4" data-variant="primary">
            <span className="neo-surface__hint">Volume total</span>
            <span className="neo-surface__value">
              {metrics.total > 0 ? currency.format(metrics.total) : '—'}
            </span>
            <p className="neo-surface__meta">Últimas emissões</p>
          </article>

          <article className="neo-surface neo-surface--interactive space-y-2 p-4" data-variant="warning">
            <span className="neo-surface__hint">A receber</span>
            <span className="neo-surface__value">
              {metrics.outstanding > 0 ? currency.format(metrics.outstanding) : '—'}
            </span>
            <p className="neo-surface__meta">Faturas pendentes</p>
          </article>

          <article className="neo-surface neo-surface--interactive space-y-2 p-4" data-variant="pink">
            <span className="neo-surface__hint">Reembolsado</span>
            <span className="neo-surface__value">
              {metrics.refunded > 0 ? currency.format(metrics.refunded) : '—'}
            </span>
            <p className="neo-surface__meta">Período seleccionado</p>
          </article>

          <article className="neo-surface neo-surface--interactive space-y-2 p-4" data-variant="teal">
            <span className="neo-surface__hint">Ticket médio</span>
            <span className="neo-surface__value">
              {metrics.average > 0 ? currency.format(metrics.average) : '—'}
            </span>
            <p className="neo-surface__meta">Por lançamento</p>
          </article>
        </div>
      </section>

      <section className="neo-panel space-y-5" aria-labelledby="billing-ledger-heading">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h2 id="billing-ledger-heading" className="neo-panel__title">
              Livro de faturação
            </h2>
            <p className="neo-panel__subtitle">
              Filtros rápidos para segmentar clientes, métodos de pagamento e estados financeiros.
            </p>
          </div>
          <div className="neo-segmented" role="tablist" aria-label="Filtrar por estado">
            {STATUS_SEGMENTS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="neo-segmented__btn"
                data-active={segment === entry.id}
                aria-pressed={segment === entry.id}
                onClick={() => setSegment(entry.id)}
              >
                <span>{entry.label}</span>
                <span className="neo-segmented__count">{statusCounts[entry.id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar cliente, serviço ou método…"
            className="input w-full sm:w-80"
            aria-label="Pesquisar lançamentos"
          />
          <div className="text-xs text-muted">
            {filtered.length} lançamento{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          {filtered.length === 0 ? (
            <div className="neo-empty">
              <span className="neo-empty__icon" aria-hidden="true">🪐</span>
              <p className="neo-empty__title">Sem lançamentos para mostrar</p>
              <p className="text-sm text-muted">
                Ajusta os filtros ou regista uma nova venda para veres o histórico aqui.
              </p>
              {(segment !== 'all' || query.trim().length > 0) && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setSegment('all');
                    setQuery('');
                  }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <table className="neo-table">
              <thead>
                <tr>
                  <th scope="col">Cliente</th>
                  <th scope="col">Serviço</th>
                  <th scope="col">Emitida</th>
                  <th scope="col">Método</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Montante</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.client}</td>
                    <td>{item.service}</td>
                    <td>{new Date(item.issuedAt).toLocaleDateString('pt-PT')}</td>
                    <td>{METHOD_LABEL[item.method]}</td>
                    <td>
                      <span className="neo-table__status" data-state={item.status}>
                        {item.status === 'paid'
                          ? 'Recebido'
                          : item.status === 'pending'
                            ? 'Pendente'
                            : 'Reembolsado'}
                      </span>
                    </td>
                    <td>{currency.format(item.amount)}</td>
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
