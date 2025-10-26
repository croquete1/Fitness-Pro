'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import clsx from 'clsx';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  BarChart3,
  Download,
  Filter,
  Layers,
  RefreshCcw,
  Search,
  Sparkles,
} from 'lucide-react';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PublishToggle, { type PublishResult } from '@/components/exercise/PublishToggle';
import { usePublicationPatches } from '@/components/exercise/usePublicationPatches';
import { formatRelativeTime } from '@/lib/datetime/relative';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import {
  type AdminExerciseRow,
  type AdminExercisesDashboardData,
  type AdminExercisesDashboardParams,
  type AdminExercisesDashboardResult,
  type AdminExercisesDistributionSegment,
  type AdminExercisesHeroMetric,
  type AdminExercisesHighlight,
  type AdminExercisesTimelinePoint,
} from '@/lib/admin/exercises/types';

const RANGE_OPTIONS: Array<{ value: '30d' | '90d' | '180d' | '365d'; label: string }> = [
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '3 meses' },
  { value: '180d', label: '6 meses' },
  { value: '365d', label: '12 meses' },
];

const PUBLISHED_OPTIONS: Array<{ value: Filters['published']; label: string }> = [
  { value: 'published', label: 'Publicados' },
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Rascunhos' },
];

const SCOPE_OPTIONS: Array<{ value: Filters['scope']; label: string; helper: string }> = [
  { value: 'global', label: 'Catálogo global', helper: 'Disponível para toda a equipa' },
  { value: 'all', label: 'Todos os exercícios', helper: 'Inclui itens privados' },
  { value: 'personal', label: 'Bibliotecas privadas', helper: 'Exercícios criados pelos treinadores' },
];

const integerFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

const shareFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

type Filters = {
  q: string;
  scope: 'all' | 'global' | 'personal';
  published: 'all' | 'published' | 'draft';
  difficulty: string;
  equipment: string;
  muscle: string;
  range: '30d' | '90d' | '180d' | '365d';
  sort: 'created_desc' | 'updated_desc' | 'name_asc';
  page: number;
  pageSize: number;
};

type MessageState = {
  tone: 'info' | 'success' | 'danger';
  text: string;
};

type Props = {
  initialData: AdminExercisesDashboardData;
  initialParams: Required<Omit<AdminExercisesDashboardParams, 'q' | 'difficulty' | 'equipment' | 'muscle'>> & {
    q?: string;
    difficulty?: string;
    equipment?: string;
    muscle?: string;
  };
};

const fetcher = async (url: string): Promise<AdminExercisesDashboardResult> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao carregar dados do catálogo');
  }
  return (await response.json()) as AdminExercisesDashboardResult;
};

function formatNumber(value: number): string {
  return integerFormatter.format(value);
}

function formatShare(value: number): string {
  return shareFormatter.format(value);
}

function formatRelative(value: string | null): string {
  return formatRelativeTime(value) ?? '—';
}

function filtersEqual(a: Filters, b: Filters): boolean {
  return (
    a.q === b.q &&
    a.scope === b.scope &&
    a.published === b.published &&
    a.difficulty === b.difficulty &&
    a.equipment === b.equipment &&
    a.muscle === b.muscle &&
    a.range === b.range &&
    a.sort === b.sort &&
    a.page === b.page &&
    a.pageSize === b.pageSize
  );
}

function CatalogTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as AdminExercisesTimelinePoint;
  return (
    <div className="admin-catalog__tooltip" role="presentation">
      <span className="admin-catalog__tooltipLabel">{point.label}</span>
      <dl>
        <div>
          <dt>Criados</dt>
          <dd>{point.created}</dd>
        </div>
        <div>
          <dt>Publicados</dt>
          <dd>{point.published}</dd>
        </div>
        <div>
          <dt>Catálogo global</dt>
          <dd>{point.global}</dd>
        </div>
      </dl>
    </div>
  );
}

function MetricCard({ metric }: { metric: AdminExercisesHeroMetric }) {
  return (
    <article className={clsx('neo-card', 'admin-catalog__metric', `tone-${metric.tone}`)}>
      <header>
        <span className="admin-catalog__metricLabel">{metric.label}</span>
        {metric.trend ? (
          <span
            className={clsx(
              'admin-catalog__metricTrend',
              metric.trend.direction === 'up' ? 'up' : 'down',
            )}
            aria-label={metric.trend.label}
          >
            <ArrowUpRight aria-hidden />
            {metric.trend.label}
          </span>
        ) : null}
      </header>
      <strong className="admin-catalog__metricValue">{metric.value}</strong>
      {metric.helper ? <p className="admin-catalog__metricHelper">{metric.helper}</p> : null}
    </article>
  );
}

function DistributionList({
  title,
  icon,
  items,
  emptyLabel,
}: {
  title: string;
  icon: React.ReactNode;
  items: AdminExercisesDistributionSegment[];
  emptyLabel: string;
}) {
  return (
    <section className="admin-catalog__panel" aria-label={title}>
      <header className="admin-catalog__panelHeader">
        <span>{icon}</span>
        <div>
          <h3>{title}</h3>
          <p>Partilha actual do catálogo.</p>
        </div>
      </header>
      <ul className="admin-catalog__distribution">
        {items.length ? (
          items.map((item) => (
            <li key={item.key}>
              <div>
                <span className="admin-catalog__distributionLabel">{item.label}</span>
                <span className="admin-catalog__distributionMeta">
                  {formatNumber(item.count)} exercício(s)
                </span>
              </div>
              <span className={clsx('admin-catalog__distributionShare', `tone-${item.tone}`)}>
                {formatShare(item.share)}
              </span>
            </li>
          ))
        ) : (
          <li className="admin-catalog__distributionEmpty">{emptyLabel}</li>
        )}
      </ul>
    </section>
  );
}

function HighlightCard({ highlight }: { highlight: AdminExercisesHighlight }) {
  return (
    <article className={clsx('admin-catalog__highlight', `tone-${highlight.tone}`)}>
      <h3>{highlight.title}</h3>
      <p>{highlight.description}</p>
    </article>
  );
}

export default function AdminCatalogClient({ initialData, initialParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = React.useState<Filters>({
    q: initialParams.q ?? '',
    scope: initialParams.scope,
    published: initialParams.published ?? 'published',
    difficulty: initialParams.difficulty ?? '',
    equipment: initialParams.equipment ?? '',
    muscle: initialParams.muscle ?? '',
    range: initialParams.range,
    sort: initialParams.sort ?? 'updated_desc',
    page: initialParams.page ?? 0,
    pageSize: initialParams.pageSize ?? 25,
  });
  const [message, setMessage] = React.useState<MessageState | null>(null);
  const [isRefreshing, startRefreshTransition] = React.useTransition();

  const applyFilters = React.useCallback((updater: (prev: Filters) => Filters) => {
    let changed = false;
    setFilters((prev) => {
      const next = updater(prev);
      if (filtersEqual(prev, next)) {
        return prev;
      }

      changed = true;
      return next;
    });
    return changed;
  }, []);

  const queryKey = React.useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.scope !== 'global') params.set('scope', filters.scope);
    if (filters.published !== 'published') params.set('published', filters.published);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.equipment) params.set('equipment', filters.equipment);
    if (filters.muscle) params.set('muscle', filters.muscle);
    params.set('range', filters.range);
    params.set('page', String(filters.page));
    params.set('pageSize', String(filters.pageSize));
    params.set('sort', filters.sort);
    return `/api/admin/catalog/dashboard?${params.toString()}`;
  }, [filters]);

  const { data, isValidating, mutate, error } = useSWR<AdminExercisesDashboardResult>(queryKey, fetcher, {
    fallbackData: { ok: true, data: initialData },
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const dashboard = data?.ok ? data.data : initialData;
  const { resolve: resolvePublication, record: recordPublication } = usePublicationPatches(dashboard.table.rows);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.scope !== 'global') params.set('scope', filters.scope);
    if (filters.published !== 'published') params.set('published', filters.published);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.equipment) params.set('equipment', filters.equipment);
    if (filters.muscle) params.set('muscle', filters.muscle);
    params.set('range', filters.range);
    if (filters.page > 0) params.set('page', String(filters.page));
    if (filters.pageSize !== 25) params.set('pageSize', String(filters.pageSize));
    if (filters.sort !== 'updated_desc') params.set('sort', filters.sort);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  }, [filters, pathname, router]);

  React.useEffect(() => {
    const client = supabaseBrowser();
    const channel = client
      .channel('admin-catalog-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exercises' }, () => {
        startRefreshTransition(() => {
          void mutate();
        });
      })
      .subscribe();
    return () => {
      void channel.unsubscribe();
    };
  }, [mutate]);

  const loading = isValidating || isRefreshing;

  const updateFilters = React.useCallback(
    (partial: Partial<Filters>, options?: { keepPage?: boolean }) => {
      applyFilters((prev) => ({
        ...prev,
        ...partial,
        page: options?.keepPage ? partial.page ?? prev.page : partial.page ?? 0,
      }));
    },
    [applyFilters],
  );

  const resetFilters = React.useCallback(() => {
    const changed = applyFilters(() => ({
      q: '',
      scope: 'global',
      published: 'published',
      difficulty: '',
      equipment: '',
      muscle: '',
      range: '180d',
      sort: 'updated_desc',
      page: 0,
      pageSize: 25,
    }));
    if (changed) {
      setMessage({ tone: 'info', text: 'Filtros repostos.' });
    }
  }, [applyFilters]);

  const refresh = React.useCallback(() => {
    startRefreshTransition(() => {
      void mutate();
    });
  }, [mutate, startRefreshTransition]);

  const handlePublishChange = React.useCallback(
    (result: PublishResult) => {
      recordPublication(result);
      refresh();
    },
    [recordPublication, refresh],
  );

  const paginatedRows = dashboard.table.rows;
  const totalCount = dashboard.table.total || 0;
  const totalPages = Math.max(Math.ceil(totalCount / filters.pageSize), 1);
  const hasRows = paginatedRows.length > 0;
  const adjustingPagination = totalCount > 0 && !hasRows;
  const showingStart = hasRows ? filters.page * filters.pageSize + 1 : 0;
  const showingEnd = hasRows ? showingStart + paginatedRows.length - 1 : 0;

  React.useEffect(() => {
    const lastPageIndex = Math.max(Math.ceil(totalCount / filters.pageSize) - 1, 0);
    if (filters.page <= lastPageIndex) {
      return;
    }

    applyFilters((prev) => {
      if (prev.page <= lastPageIndex) {
        return prev;
      }

      return { ...prev, page: lastPageIndex };
    });
  }, [applyFilters, filters.page, filters.pageSize, totalCount]);

  function exportCSV() {
    if (!paginatedRows.length) {
      setMessage({ tone: 'info', text: 'Não existem exercícios para exportar.' });
      return;
    }

    const header = [
      'id',
      'nome',
      'musculo',
      'equipamento',
      'dificuldade',
      'audiencia',
      'publicado',
      'global',
      'criador',
      'email',
      'criado_em',
      'publicado_em',
      'descricao',
      'video',
    ];

    const lines = [
      header.join(','),
      ...paginatedRows.map((row) => {
        const publication = resolvePublication(row);
        return [
          row.id,
          row.name,
          row.muscleGroup ?? '',
          row.equipment ?? '',
          row.difficulty ?? '',
          row.audienceLabel,
          publication.isPublished ? 'sim' : 'nao',
          row.isGlobal ? 'global' : 'privado',
          row.creatorLabel,
          row.creatorEmail ?? '',
          row.createdAt ?? '',
          publication.publishedAt ?? '',
          (row.description ?? '').replace(/\r?\n/g, ' '),
          row.videoUrl ?? '',
        ]
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',');
      }),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'catalogo-exercicios.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage({ tone: 'success', text: 'Exportação CSV iniciada.' });
  }

  const emptyState = totalCount === 0;
  const statusLabel = emptyState
    ? 'Sem exercícios para apresentar.'
    : adjustingPagination
      ? 'A ajustar paginação aos novos filtros…'
      : `A mostrar ${formatNumber(showingStart)}–${formatNumber(showingEnd)} de ${formatNumber(totalCount)} exercício(s).`;

  React.useEffect(() => {
    if (error) {
      setMessage({ tone: 'danger', text: error.message });
    }
  }, [error]);

  return (
    <div className="admin-catalog" data-loading={loading ? 'true' : 'false'}>
      <PageHeader
        title="Catálogo administrativo de exercícios"
        subtitle="Analisa a saúde do catálogo global, acompanha a adopção e gere rapidamente novas entradas."
        sticky={false}
      />

      {message ? (
        <Alert tone={message.tone} className="admin-catalog__alert">
          <span>{message.text}</span>
          <button
            type="button"
            className="admin-catalog__alertDismiss"
            onClick={() => setMessage(null)}
            aria-label="Fechar aviso"
          >
            Fechar
          </button>
        </Alert>
      ) : null}

      <section className="admin-catalog__toolbar" aria-label="Filtros do catálogo">
        <div className="admin-catalog__filters">
          <label className="admin-catalog__field">
            <span className="admin-catalog__fieldLabel">
              <Search aria-hidden /> Pesquisa
            </span>
            <input
              className="neo-field"
              placeholder="Nome, músculo, equipamento…"
              value={filters.q}
              onChange={(event) => updateFilters({ q: event.target.value })}
              aria-label="Pesquisar exercícios"
            />
          </label>

          <label className="admin-catalog__field">
            <span className="admin-catalog__fieldLabel">
              <Filter aria-hidden /> Dificuldade
            </span>
            <select
              className="neo-field"
              value={filters.difficulty}
              onChange={(event) => updateFilters({ difficulty: event.target.value })}
            >
              <option value="">Todas</option>
              {dashboard.facets.difficulties.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-catalog__field">
            <span className="admin-catalog__fieldLabel">
              <Filter aria-hidden /> Equipamento
            </span>
            <select
              className="neo-field"
              value={filters.equipment}
              onChange={(event) => updateFilters({ equipment: event.target.value })}
            >
              <option value="">Todos</option>
              {dashboard.facets.equipments.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-catalog__field">
            <span className="admin-catalog__fieldLabel">
              <Filter aria-hidden /> Grupo muscular
            </span>
            <select
              className="neo-field"
              value={filters.muscle}
              onChange={(event) => updateFilters({ muscle: event.target.value })}
            >
              <option value="">Todos</option>
              {dashboard.facets.muscles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-catalog__secondaryFilters">
          <div className="neo-segmented" role="radiogroup" aria-label="Âmbito analisado">
            {SCOPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="neo-segmented__btn"
                data-active={filters.scope === option.value}
                onClick={() => updateFilters({ scope: option.value })}
              >
                <strong>{option.label}</strong>
                <span className="neo-segmented__count">{option.helper}</span>
              </button>
            ))}
          </div>

          <div className="neo-segmented" role="radiogroup" aria-label="Estado de publicação">
            {PUBLISHED_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="neo-segmented__btn"
                data-active={filters.published === option.value}
                onClick={() => updateFilters({ published: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="admin-catalog__range">
            <span className="admin-catalog__rangeLabel">Intervalo temporal</span>
            <div className="neo-segmented" role="radiogroup" aria-label="Intervalo temporal">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="neo-segmented__btn"
                  data-active={filters.range === option.value}
                  onClick={() => updateFilters({ range: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-catalog__actions">
          <Button variant="ghost" leftIcon={<RefreshCcw aria-hidden />} onClick={refresh}>
            Actualizar
          </Button>
          <Button variant="ghost" leftIcon={<Download aria-hidden />} onClick={exportCSV}>
            Exportar CSV
          </Button>
          <Link className="btn" data-variant="primary" href="/dashboard/admin/exercises/new">
            Novo exercício
          </Link>
          <Button variant="ghost" onClick={resetFilters}>
            Repor filtros
          </Button>
        </div>
      </section>

      <section className="admin-catalog__metrics" aria-label="Métricas principais">
        {dashboard.hero.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="admin-catalog__panel" aria-label="Actividade temporal">
        <header className="admin-catalog__panelHeader">
          <span>
            <BarChart3 aria-hidden />
          </span>
          <div>
            <h3>Actividade recente</h3>
            <p>{dashboard.rangeLabel}</p>
          </div>
        </header>
        <div className="admin-catalog__chart">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={dashboard.timeline}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--neo-border-strong)" opacity={0.3} />
              <XAxis dataKey="label" stroke="var(--neo-text-subtle)" />
              <YAxis allowDecimals={false} stroke="var(--neo-text-subtle)" />
              <Tooltip content={<CatalogTooltip />} />
              <Area type="monotone" dataKey="created" stroke="var(--neo-chart-primary)" fillOpacity={0.18} fill="var(--neo-chart-primary)" />
              <Area type="monotone" dataKey="published" stroke="var(--neo-chart-success)" fillOpacity={0.16} fill="var(--neo-chart-success)" />
              <Area type="monotone" dataKey="global" stroke="var(--neo-chart-warning)" fillOpacity={0.1} fill="var(--neo-chart-warning)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-catalog__insights" aria-label="Distribuição do catálogo">
        <DistributionList
          title="Por dificuldade"
          icon={<Layers aria-hidden />}
          items={dashboard.difficulties}
          emptyLabel="Sem registos suficientes para analisar a dificuldade."
        />
        <DistributionList
          title="Por grupos musculares"
          icon={<Sparkles aria-hidden />}
          items={dashboard.muscles}
          emptyLabel="Sem grupos musculares registados."
        />
        <DistributionList
          title="Por equipamento"
          icon={<Filter aria-hidden />}
          items={dashboard.equipments}
          emptyLabel="Sem equipamentos registados."
        />
      </section>

      <section className="admin-catalog__highlights" aria-label="Destaques automáticos">
        {dashboard.highlights.map((highlight) => (
          <HighlightCard key={highlight.id} highlight={highlight} />
        ))}
      </section>

      <section className="admin-catalog__tableSection" aria-label="Listagem do catálogo">
        <header className="admin-catalog__tableHeader">
          <div>
            <h2>Exercícios</h2>
            <p aria-live="polite" aria-atomic="true">
              {statusLabel}
            </p>
          </div>
          <div className="admin-catalog__paginationControls">
            <label className="admin-catalog__pageSize">
              Entradas por página
              <select
                className="neo-field"
                value={filters.pageSize}
                onChange={(event) => updateFilters({ pageSize: Number(event.target.value) || 25, page: 0 }, { keepPage: false })}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="admin-catalog__pager">
              <Button
                variant="ghost"
                disabled={filters.page === 0}
                onClick={() => updateFilters({ page: Math.max(filters.page - 1, 0) }, { keepPage: true })}
              >
                Anterior
              </Button>
              <span>
                Página {filters.page + 1} de {totalPages}
              </span>
              <Button
                variant="ghost"
                disabled={filters.page + 1 >= totalPages}
                onClick={() =>
                  updateFilters({ page: Math.min(filters.page + 1, totalPages - 1) }, { keepPage: true })
                }
              >
                Seguinte
              </Button>
            </div>
          </div>
        </header>

        <div
          className="admin-catalog__tableWrapper"
          aria-busy={loading || adjustingPagination}
          data-adjusting={adjustingPagination ? 'true' : undefined}
        >
          <table>
            <thead>
              <tr>
                <th>Exercício</th>
                <th>Detalhes</th>
                <th>Dificuldade</th>
                <th>Estado</th>
                <th>Actualização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {emptyState ? (
                <tr>
                  <td colSpan={6} className="admin-catalog__tableEmpty">
                    Não existem exercícios com os filtros actuais.
                  </td>
                </tr>
              ) : adjustingPagination ? (
                <tr>
                  <td colSpan={6} className="admin-catalog__tableEmpty">
                    {statusLabel}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const publication = resolvePublication(row);
                  return (
                    <tr key={row.id}>
                      <td>
                        <span className="admin-catalog__tableName">{row.name}</span>
                        <span className="admin-catalog__tableCreator">{row.creatorLabel}</span>
                      </td>
                      <td>
                        <ul className="admin-catalog__tags">
                          {row.muscleTags.map((tag) => (
                            <li key={`muscle-${row.id}-${tag}`}>{tag}</li>
                          ))}
                          {row.equipmentTags.map((tag) => (
                            <li key={`equipment-${row.id}-${tag}`}>{tag}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <span className={clsx('admin-catalog__badge', row.difficulty?.toLowerCase())}>
                          {row.difficulty ?? '—'}
                        </span>
                      </td>
                      <td>
                        <span className={clsx('admin-catalog__badge', row.isGlobal ? 'global' : 'private')}>
                          {row.isGlobal ? 'Global' : 'Privado'}
                        </span>
                        <span className={clsx('admin-catalog__badge', publication.isPublished ? 'published' : 'draft')}>
                          {publication.isPublished ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>
                      <td>
                        <span className="admin-catalog__tableMeta">
                          Criado {formatRelative(row.createdAt ?? null)}
                        </span>
                        <span className="admin-catalog__tableMeta">
                          Actualizado {formatRelative(publication.updatedAt)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-catalog__tableActions">
                          <PublishToggle
                            id={row.id}
                            published={publication.isPublished}
                            onChange={handlePublishChange}
                          />
                          <Link
                            className="btn"
                            data-variant="ghost"
                            data-size="sm"
                            href={`/dashboard/admin/exercises/${row.id}`}
                          >
                            Abrir
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="admin-catalog__footer" aria-label="Metadados do catálogo">
        <span>
          Última geração: {formatRelative(dashboard.generatedAt)} · Dados actualizados automaticamente quando existem alterações.
        </span>
        <span>
          Fonte: servidor remoto (`exercises`, actualizações em tempo real) · Intervalo seleccionado: {dashboard.rangeLabel}
        </span>
      </footer>
    </div>
  );
}
