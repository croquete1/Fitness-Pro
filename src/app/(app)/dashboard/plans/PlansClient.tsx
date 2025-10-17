'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

type Row = {
  id: string | number;
  title?: string | null;
  status?: string | null;
  updated_at?: string | null;
  trainer_id?: string | null;
};

const updatedFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatUpdated(iso: string | null | undefined) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return updatedFormatter.format(date);
}

function friendlyStatus(value: string | null | undefined) {
  const raw = (value ?? '').toString().trim();
  if (!raw) return 'Sem estado';
  return raw
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

type StatusTone = 'ok' | 'warn' | 'down';

function toneForStatus(value: string | null | undefined): StatusTone {
  const status = (value ?? '').toString().trim().toUpperCase();
  if ([
    'ATIVO',
    'ACTIVE',
    'APPROVED',
    'LIVE',
    'PUBLISHED',
    'IN_PROGRESS',
  ].includes(status)) {
    return 'ok';
  }
  if ([
    'PAUSADO',
    'PAUSED',
    'PENDING',
    'DRAFT',
    'WAITING',
    'REQUESTED',
    'IN_REVIEW',
  ].includes(status)) {
    return 'warn';
  }
  if (!status) return 'warn';
  return 'down';
}

export default function PlansClient({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('');

  const normalizedRows = useMemo(() => {
    return [...rows]
      .map((row) => ({
        ...row,
        title: row.title?.trim() || 'Plano de treino',
      }))
      .sort((a, b) => {
        const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bTime - aTime;
      });
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return normalizedRows;
    return normalizedRows.filter((row) => {
      const haystack = [
        row.title?.toLowerCase() ?? '',
        friendlyStatus(row.status).toLowerCase(),
        row.trainer_id?.toLowerCase() ?? '',
      ];
      return haystack.some((field) => field.includes(normalizedQuery));
    });
  }, [normalizedRows, query]);

  const hasAnyRows = normalizedRows.length > 0;
  const noResults = filteredRows.length === 0;
  const emptyTitle = hasAnyRows ? 'Sem resultados' : 'Sem planos de treino';
  const emptyDescription = hasAnyRows
    ? 'Ajusta ou limpa o filtro para voltares a ver todos os planos disponíveis.'
    : 'Quando o teu PT publicar novos planos vais encontrá-los aqui automaticamente.';

  return (
    <div className="client-plans">
      <PageHeader
        title="Planos de treino"
        subtitle="Consulta e acompanha os planos partilhados pelo teu PT sem sair do tema Neo."
      />

      <section className="neo-panel client-plans__panel" aria-labelledby="client-plans-heading">
        <header className="neo-panel__header client-plans__header">
          <div className="neo-panel__meta">
            <h2 id="client-plans-heading" className="neo-panel__title">
              Histórico de planos
            </h2>
            <p className="neo-panel__subtitle">Ordenados pela atualização mais recente.</p>
          </div>
          <div className="neo-panel__actions neo-panel__actions--table client-plans__actions">
            <div className="neo-input-group client-plans__search">
              <label htmlFor="client-plans-search" className="neo-input-group__label">
                Pesquisa
              </label>
              <div className="neo-input-group__field">
                <input
                  id="client-plans-search"
                  type="search"
                  className="neo-input neo-input--compact"
                  placeholder="Filtrar por nome ou estado"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <span className="client-plans__count" role="status" aria-live="polite">
              {filteredRows.length} plano(s)
            </span>
          </div>
        </header>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table client-plans__table">
            <thead>
              <tr>
                <th>Plano</th>
                <th className="client-plans__statusHeading">Estado</th>
                <th className="client-plans__updatedHeading">Atualizado</th>
                <th className="neo-table__cell--right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const statusLabel = friendlyStatus(row.status);
                const statusTone = toneForStatus(row.status);
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="client-plans__title">
                        <span className="client-plans__name">{row.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill" data-state={statusTone}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <time dateTime={row.updated_at ?? undefined} className="client-plans__updated">
                        {formatUpdated(row.updated_at)}
                      </time>
                    </td>
                    <td className="neo-table__cell--right">
                      <div className="neo-table__actions">
                        <Link
                          href={`/dashboard/plans/${row.id}`}
                          className="btn ghost"
                          data-size="sm"
                          prefetch={false}
                        >
                          Abrir
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {noResults && (
                <tr>
                  <td colSpan={4}>
                    <div className="neo-empty client-plans__empty">
                      <span className="neo-empty__icon" aria-hidden>
                        📄
                      </span>
                      <p className="neo-empty__title">{emptyTitle}</p>
                      <p className="neo-empty__description">{emptyDescription}</p>
                      {query.trim() && (
                        <button
                          type="button"
                          className="btn link client-plans__reset"
                          onClick={() => setQuery('')}
                        >
                          Limpar pesquisa
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
