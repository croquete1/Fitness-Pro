// src/app/(app)/dashboard/admin/onboarding/AdminOnboardingListClient.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, RefreshCcw, Search } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import OpenInNewToggle from '@/components/ui/OpenInNewToggle';
import { navigate } from '@/lib/nav';

type Status = 'draft' | 'submitted' | string | null | undefined;

type Row = {
  id: string;
  userId: string;
  user: string;
  name?: string | null;
  email?: string | null;
  status: Status;
  created_at: string | null;
  updated_at: string | null;
};

type Metric = {
  id: string;
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
  hint?: string;
};

type SortOption = 'updated_desc' | 'created_desc' | 'name_asc';

type FreshnessOption = 'any' | '7d' | '30d';

type Props = {
  initialRows: Row[];
};

const STATUS_META: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  submitted: { label: 'Submetido', tone: 'success' },
  draft: { label: 'Rascunho', tone: 'warning' },
};

const FRESHNESS_LABEL: Record<FreshnessOption, string> = {
  any: 'Qualquer data',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
};

const MILLIS_PER_DAY = 86_400_000;

function normaliseStatus(status: Status) {
  if (!status) return 'unknown';
  return String(status).trim().toLowerCase();
}

function resolveStatus(status: Status) {
  const key = normaliseStatus(status);
  return STATUS_META[key] ?? { label: status ? String(status) : '—', tone: 'neutral' as const };
}

function parseTimestamp(value?: string | null) {
  if (!value) return 0;
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function bestTimestamp(row: Row) {
  return parseTimestamp(row.updated_at) || parseTimestamp(row.created_at);
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return '—';
  }
}

function formatRelative(value?: string | null) {
  if (!value) return null;
  try {
    const date = new Date(value);
    const ts = date.getTime();
    if (Number.isNaN(ts)) return null;
    const diff = ts - Date.now();
    const abs = Math.abs(diff);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const rtf = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

    if (abs < hour) return rtf.format(Math.round(diff / minute), 'minute');
    if (abs < day) return rtf.format(Math.round(diff / hour), 'hour');
    if (abs < 30 * day) return rtf.format(Math.round(diff / day), 'day');
    if (abs < 18 * 30 * day) return rtf.format(Math.round(diff / (30 * day)), 'month');
    return rtf.format(Math.round(diff / (365 * day)), 'year');
  } catch {
    return null;
  }
}

const SORTERS: Record<SortOption, (a: Row, b: Row) => number> = {
  updated_desc: (a, b) => bestTimestamp(b) - bestTimestamp(a),
  created_desc: (a, b) => parseTimestamp(b.created_at) - parseTimestamp(a.created_at),
  name_asc: (a, b) => a.user.localeCompare(b.user, 'pt-PT', { sensitivity: 'base' }),
};

export default function AdminOnboardingListClient({ initialRows }: Props) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<'all' | 'draft' | 'submitted'>('all');
  const [freshness, setFreshness] = React.useState<FreshnessOption>('any');
  const [sortBy, setSortBy] = React.useState<SortOption>('updated_desc');
  const [openInNew, setOpenInNew] = React.useState(false);
  const [isRefreshing, startRefreshTransition] = React.useTransition();

  const rows = React.useMemo(() => initialRows ?? [], [initialRows]);

  const metrics = React.useMemo(() => {
    const total = rows.length;
    const submitted = rows.filter((row) => normaliseStatus(row.status) === 'submitted').length;
    const drafts = rows.filter((row) => normaliseStatus(row.status) === 'draft').length;
    const lastUpdatedTs = rows.reduce((acc, row) => {
      const ts = bestTimestamp(row);
      return ts > acc ? ts : acc;
    }, 0);
    const lastUpdatedAt = lastUpdatedTs ? new Date(lastUpdatedTs).toISOString() : null;
    const submissionRate = total > 0 ? Math.round((submitted / total) * 100) : 0;

    const list: Metric[] = [
      {
        id: 'total',
        label: 'Formulários activos',
        value: String(total),
        tone: 'primary',
      },
      {
        id: 'submitted',
        label: 'Submetidos',
        value: total > 0 ? `${submitted} (${submissionRate}%)` : '0',
        tone: 'success',
        hint: total > 0 ? `Taxa real calculada com base em ${total} formulários` : undefined,
      },
      {
        id: 'drafts',
        label: 'Rascunhos',
        value: String(drafts),
        tone: drafts > 0 ? 'warning' : 'neutral',
      },
      {
        id: 'latest',
        label: 'Última actualização',
        value: formatRelative(lastUpdatedAt) ?? 'Sem registos',
        tone: 'info',
        hint: lastUpdatedAt ? formatDate(lastUpdatedAt) : undefined,
      },
    ];

    return list;
  }, [rows]);

  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorter = SORTERS[sortBy];
    const days = freshness === 'any' ? null : freshness === '7d' ? 7 : 30;
    const threshold = days == null ? null : Date.now() - days * MILLIS_PER_DAY;

    return [...rows]
      .filter((row) => {
        if (status !== 'all' && normaliseStatus(row.status) !== status) return false;

        if (threshold != null) {
          const ts = bestTimestamp(row);
          if (!ts || ts < threshold) return false;
        }

        if (!query) return true;

        const haystack = [row.user, row.name ?? '', row.email ?? '', row.userId, normaliseStatus(row.status)]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort(sorter);
  }, [rows, search, status, sortBy, freshness]);

  const activeFilters = React.useMemo(() => {
    const parts: string[] = [];
    if (status !== 'all') {
      parts.push(status === 'submitted' ? 'A mostrar apenas formulários submetidos' : 'A mostrar apenas rascunhos');
    }
    if (freshness !== 'any') {
      parts.push(`Actualizados nos ${FRESHNESS_LABEL[freshness].toLowerCase()}`);
    }
    if (search.trim()) {
      parts.push(`Pesquisa: “${search.trim()}”`);
    }
    return parts.length ? parts.join(' · ') : 'Sem filtros adicionais — todos os registos reais estão visíveis.';
  }, [status, freshness, search]);

  const handleRefresh = React.useCallback(() => {
    startRefreshTransition(() => {
      router.refresh();
    });
  }, [router, startRefreshTransition]);

  const openDetails = React.useCallback(
    (rowId: string) => {
      navigate(`/dashboard/admin/onboarding/${rowId}`, openInNew);
    },
    [openInNew],
  );

  return (
    <div className="neo-stack neo-stack--lg admin-onboarding">
      <PageHeader
        title="Onboarding físico"
        subtitle="Avaliações de entrada sincronizadas via servidor com estados e timestamps reais."
        actions={(
          <div className="neo-inline neo-inline--sm neo-inline--end">
            <OpenInNewToggle checked={openInNew} onChange={setOpenInNew} label="Abrir revisão em nova aba" />
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-busy={isRefreshing ? 'true' : undefined}
            >
              <span className="btn__icon">
                <RefreshCcw className="neo-icon neo-icon--sm" aria-hidden="true" />
              </span>
              <span className="btn__label">{isRefreshing ? 'A actualizar…' : 'Actualizar'}</span>
            </button>
          </div>
        )}
      />

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Indicadores de onboarding">
        <div className="admin-onboarding__metrics">
          {metrics.map((metric) => (
            <article key={metric.id} className="admin-onboarding__metric" data-tone={metric.tone}>
              <span className="admin-onboarding__metricLabel">{metric.label}</span>
              <span className="admin-onboarding__metricValue" title={metric.hint}>
                {metric.value}
              </span>
              {metric.hint && (
                <span className="admin-onboarding__metricHint">{metric.hint}</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Filtros e pesquisa">
        <div className="admin-onboarding__filters" role="group" aria-label="Filtros de pesquisa">
          <label htmlFor="admin-onboarding-search" className="admin-onboarding__field">
            <span className="admin-onboarding__label">Pesquisa</span>
            <div className="admin-onboarding__search">
              <Search className="admin-onboarding__searchIcon" aria-hidden="true" />
              <input
                id="admin-onboarding-search"
                type="search"
                className="neo-field admin-onboarding__searchInput"
                placeholder="Nome, email ou ID"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </label>

          <label htmlFor="admin-onboarding-status" className="admin-onboarding__field">
            <span className="admin-onboarding__label">Estado</span>
            <select
              id="admin-onboarding-status"
              className="neo-field"
              value={status}
              onChange={(event) => setStatus(event.target.value as 'all' | 'draft' | 'submitted')}
            >
              <option value="all">Todos</option>
              <option value="submitted">Submetidos</option>
              <option value="draft">Rascunhos</option>
            </select>
          </label>

          <label htmlFor="admin-onboarding-freshness" className="admin-onboarding__field">
            <span className="admin-onboarding__label">Actualização</span>
            <select
              id="admin-onboarding-freshness"
              className="neo-field"
              value={freshness}
              onChange={(event) => setFreshness(event.target.value as FreshnessOption)}
            >
              <option value="any">Qualquer data</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </label>

          <label htmlFor="admin-onboarding-sort" className="admin-onboarding__field">
            <span className="admin-onboarding__label">Ordenação</span>
            <select
              id="admin-onboarding-sort"
              className="neo-field"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              <option value="updated_desc">Mais recentes primeiro</option>
              <option value="created_desc">Criados mais recentes</option>
              <option value="name_asc">Nome (A–Z)</option>
            </select>
          </label>
        </div>
        <p className="admin-onboarding__filtersSummary">{activeFilters}</p>
      </section>

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Tabela de avaliações">
        <header className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
          <div className="neo-stack neo-stack--xs">
            <h2 className="neo-panel__title">Avaliações registadas</h2>
            <p className="neo-panel__subtitle">
              Mostrando {filteredRows.length} de {rows.length} formulários reais.
            </p>
          </div>
          <div className="neo-inline neo-inline--sm neo-inline--end">
            <span className="neo-tag" data-tone="primary">
              {filteredRows.length} listados
            </span>
            <span className="neo-tag" data-tone="neutral">
              {rows.length} no total
            </span>
          </div>
        </header>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Estado</th>
                <th scope="col">Criado</th>
                <th scope="col">Actualizado</th>
                <th scope="col" className="neo-table__cell--right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="neo-table-empty">
                      {rows.length === 0
                        ? 'Ainda não existem formulários de onboarding registados no servidor.'
                        : 'Nenhum formulário corresponde aos filtros aplicados.'}
                    </div>
                  </td>
                </tr>
              )}

              {filteredRows.map((row) => {
                const { label, tone } = resolveStatus(row.status);
                const createdLabel = formatDate(row.created_at);
                const updatedBase = row.updated_at ?? row.created_at;
                const updatedLabel = formatDate(updatedBase);
                const updatedRelative = formatRelative(updatedBase);

                return (
                  <tr
                    key={row.id}
                    className="admin-onboarding__row"
                    tabIndex={0}
                    role="button"
                    onClick={() => openDetails(row.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openDetails(row.id);
                      }
                    }}
                    aria-label={`Abrir formulário de ${row.user}`}
                  >
                    <td data-title="Cliente">
                      <div className="neo-stack neo-stack--xs">
                        <span className="neo-text--sm neo-text--semibold text-fg">{row.name ?? row.user}</span>
                        <span className="neo-text--xs neo-text--muted">
                          {row.email ?? row.user}
                          {' · ID: '}
                          {row.userId}
                        </span>
                      </div>
                    </td>
                    <td data-title="Estado">
                      <span className="neo-table__status" data-state={tone}>
                        {label}
                      </span>
                    </td>
                    <td data-title="Criado">
                      <div className="neo-stack neo-stack--xs">
                        <span className="neo-text--sm text-fg">{createdLabel}</span>
                        <span className="admin-onboarding__relative">{formatRelative(row.created_at) ?? ''}</span>
                      </div>
                    </td>
                    <td data-title="Actualizado">
                      <div className="neo-stack neo-stack--xs">
                        <span className="neo-text--sm text-fg">{updatedLabel}</span>
                        <span className="admin-onboarding__relative">{updatedRelative ?? ''}</span>
                      </div>
                    </td>
                    <td data-title="Acções" className="neo-table__cell--right">
                      <div className="neo-inline neo-inline--sm neo-inline--end">
                        <button
                          type="button"
                          className="btn"
                          data-variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDetails(row.id);
                          }}
                        >
                          <span className="btn__icon">
                            <ArrowUpRight className="neo-icon neo-icon--sm" aria-hidden="true" />
                          </span>
                          <span className="btn__label">Abrir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
