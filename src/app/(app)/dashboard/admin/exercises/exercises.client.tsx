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
import {
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  Download,
  Edit,
  Filter,
  Layers,
  LineChart,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PublishToggle, { type PublishResult } from '@/components/exercise/PublishToggle';
import { usePublicationPatches } from '@/components/exercise/usePublicationPatches';
import { ExerciseFormValues } from '@/lib/exercises/schema';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import AdminExerciseFormClient from './AdminExerciseFormClient';
import {
  type AdminExercisesDashboardData,
  type AdminExercisesDashboardParams,
  type AdminExercisesDashboardResult,
  type AdminExerciseRow,
  type AdminExercisesHighlight,
  type AdminExercisesHeroMetric,
  type AdminExercisesTimelinePoint,
} from '@/lib/admin/exercises/types';

type Props = {
  initialData: AdminExercisesDashboardData;
  initialParams: Required<Omit<AdminExercisesDashboardParams, 'q' | 'difficulty' | 'equipment' | 'muscle'>> & {
    q?: string;
    difficulty?: string;
    equipment?: string;
    muscle?: string;
  };
};

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
  tone: 'success' | 'danger' | 'info';
  text: string;
};

const RANGE_LABEL: Record<Filters['range'], string> = {
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  '180d': 'Últimos 6 meses',
  '365d': 'Últimos 12 meses',
};

const fetcher = async (url: string): Promise<AdminExercisesDashboardResult> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao carregar dados');
  }
  return (await response.json()) as AdminExercisesDashboardResult;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(value);
}

function formatShare(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  try {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return '—';
    const diff = date.getTime() - Date.now();
    const abs = Math.abs(diff);
    const minute = 60_000;
    const hour = 3_600_000;
    const day = 86_400_000;
    const formatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });
    if (abs < hour) return formatter.format(Math.round(diff / minute), 'minute');
    if (abs < day) return formatter.format(Math.round(diff / hour), 'hour');
    if (abs < 30 * day) return formatter.format(Math.round(diff / day), 'day');
    return formatter.format(Math.round(diff / (30 * day)), 'month');
  } catch {
    return '—';
  }
}

function ExerciseTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as AdminExercisesTimelinePoint;
  return (
    <div className="admin-exercises__tooltip" role="presentation">
      <span className="admin-exercises__tooltipLabel">{point.label}</span>
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
    <article className={clsx('neo-card', 'admin-exercises__metric', `tone-${metric.tone}`)}>
      <header>
        <span className="admin-exercises__metricLabel">{metric.label}</span>
        {metric.trend ? (
          <span
            className={clsx('admin-exercises__metricTrend', metric.trend.direction === 'up' ? 'up' : 'down')}
            aria-label={metric.trend.label}
          >
            <ArrowUpRight aria-hidden />
            {metric.trend.label}
          </span>
        ) : null}
      </header>
      <strong className="admin-exercises__metricValue">{metric.value}</strong>
      {metric.helper ? <p className="admin-exercises__metricHelper">{metric.helper}</p> : null}
    </article>
  );
}

function HighlightCard({ highlight }: { highlight: AdminExercisesHighlight }) {
  return (
    <article className={clsx('neo-card', 'admin-exercises__highlight', `tone-${highlight.tone}`)}>
      <h3>{highlight.title}</h3>
      <p>{highlight.description}</p>
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
  items: AdminExercisesDashboardData['muscles'];
  emptyLabel: string;
}) {
  return (
    <section className="neo-panel admin-exercises__panel" aria-label={title}>
      <header className="neo-panel__header">
        <div>
          <h3 className="neo-panel__title">{title}</h3>
          <p className="neo-panel__subtitle">Distribuição baseada nos filtros actuais.</p>
        </div>
        <span className="neo-panel__icon" aria-hidden>
          {icon}
        </span>
      </header>
      <ul className="admin-exercises__distribution">
        {items.length ? (
          items.map((item) => (
            <li key={item.key}>
              <div>
                <span className="admin-exercises__distributionLabel">{item.label}</span>
                <span className="admin-exercises__distributionMeta">{formatNumber(item.count)} exercícios</span>
              </div>
              <span className={clsx('admin-exercises__distributionShare', `tone-${item.tone}`)}>
                {formatShare(item.share)}
              </span>
            </li>
          ))
        ) : (
          <li className="admin-exercises__distributionEmpty">{emptyLabel}</li>
        )}
      </ul>
    </section>
  );
}

export default function AdminExercisesClient({ initialData, initialParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = React.useState<Filters>({
    q: initialParams.q ?? '',
    scope: initialParams.scope,
    published: initialParams.published,
    difficulty: initialParams.difficulty ?? '',
    equipment: initialParams.equipment ?? '',
    muscle: initialParams.muscle ?? '',
    range: initialParams.range,
    sort: initialParams.sort,
    page: initialParams.page ?? 0,
    pageSize: initialParams.pageSize ?? 20,
  });
  const [message, setMessage] = React.useState<MessageState | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [cloneRow, setCloneRow] = React.useState<AdminExerciseRow | null>(null);
  const [isRefreshing, startRefreshTransition] = React.useTransition();

  const queryKey = React.useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.scope !== 'all') params.set('scope', filters.scope);
    if (filters.published !== 'all') params.set('published', filters.published);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.equipment) params.set('equipment', filters.equipment);
    if (filters.muscle) params.set('muscle', filters.muscle);
    params.set('range', filters.range);
    params.set('page', String(filters.page));
    params.set('pageSize', String(filters.pageSize));
    params.set('sort', filters.sort);
    return `/api/admin/exercises/dashboard?${params.toString()}`;
  }, [filters]);

  const { data, isValidating, mutate } = useSWR<AdminExercisesDashboardResult>(queryKey, fetcher, {
    fallbackData: { ok: true, data: initialData },
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const dashboard = data?.ok ? data.data : initialData;
  const { resolve: resolvePublication, record: recordPublication } = usePublicationPatches(dashboard.table.rows);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.scope !== 'all') params.set('scope', filters.scope);
    if (filters.published !== 'all') params.set('published', filters.published);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.equipment) params.set('equipment', filters.equipment);
    if (filters.muscle) params.set('muscle', filters.muscle);
    params.set('range', filters.range);
    if (filters.page > 0) params.set('page', String(filters.page));
    if (filters.pageSize !== 20) params.set('pageSize', String(filters.pageSize));
    if (filters.sort !== 'created_desc') params.set('sort', filters.sort);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  }, [filters, pathname, router]);

  React.useEffect(() => {
    const client = supabaseBrowser();
    const channel = client
      .channel('admin-exercises-dashboard')
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

  function updateFilters(partial: Partial<Filters>, options?: { keepPage?: boolean }) {
    setFilters((prev) => ({
      ...prev,
      ...partial,
      page: options?.keepPage ? partial.page ?? prev.page : partial.page ?? 0,
    }));
  }

  function resetFilters() {
    setFilters({
      q: '',
      scope: 'all',
      published: 'all',
      difficulty: '',
      equipment: '',
      muscle: '',
      range: '180d',
      sort: 'created_desc',
      page: 0,
      pageSize: 20,
    });
  }

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

  async function handleDelete(row: AdminExerciseRow) {
    if (!window.confirm(`Remover "${row.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/exercises/${row.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await response.text());
      setMessage({ tone: 'success', text: 'Exercício removido.' });
      startRefreshTransition(() => {
        void mutate();
      });
    } catch (error: any) {
      console.error('[admin-exercises] delete', error);
      setMessage({ tone: 'danger', text: error?.message ?? 'Falha ao remover o exercício.' });
    }
  }

  const paginatedRows = dashboard.table.rows;
  const totalPages = Math.max(Math.ceil((dashboard.table.total || 0) / filters.pageSize), 1);
  const showingStart = filters.page * filters.pageSize + 1;
  const showingEnd = Math.min(dashboard.table.total, showingStart + paginatedRows.length - 1);

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
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exercicios.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function printList() {
    if (!paginatedRows.length) {
      setMessage({ tone: 'info', text: 'Não existem exercícios para imprimir.' });
      return;
    }
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!popup) return;
    const rows = paginatedRows
      .map((row) => {
        const publication = resolvePublication(row);
        const cells = [
          row.name,
          row.muscleGroup ?? '',
          row.equipment ?? '',
          row.difficulty ?? '',
          row.audienceLabel,
          publication.isPublished ? 'Publicado' : 'Rascunho',
          row.creatorLabel,
          row.createdAt ?? '',
          publication.publishedAt ?? '',
        ]
          .map((cell) => `<td>${String(cell ?? '')}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    popup.document.open();
    popup.document.write(`
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Exercícios</title>
          <style>
            body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; font-size: 12px; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Catálogo de exercícios</h1>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Grupo muscular</th>
                <th>Equipamento</th>
                <th>Dificuldade</th>
                <th>Disponibilidade</th>
                <th>Estado</th>
                <th>Criado por</th>
                <th>Criado em</th>
                <th>Publicado em</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>window.onload = function () { window.print(); };</script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  function mapCloneInitial(row: AdminExerciseRow) {
    const difficultyOptions: ExerciseFormValues['difficulty'][] = ['Fácil', 'Média', 'Difícil'];
    const normalisedDifficulty = difficultyOptions.find((option) => option === row.difficulty) ?? undefined;
    return {
      name: row.name ?? '',
      muscle_group: row.muscleGroup ?? '',
      equipment: row.equipment ?? '',
      difficulty: normalisedDifficulty,
      description: row.description ?? '',
      video_url: row.videoUrl ?? '',
    };
  }

  return (
    <div className="admin-exercises">
      <PageHeader
        title="Catálogo de exercícios"
        subtitle="Analisa o desempenho do catálogo, acompanha publicações e gere as opções disponíveis para a equipa."
        sticky
      />

      <div className="admin-exercises__layout">
        <section className="admin-exercises__metrics" aria-label="Indicadores principais">
          {dashboard.hero.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </section>

        <section className="admin-exercises__toolbar" aria-label="Filtros e acções">
          <div className="admin-exercises__filters">
            <label className="admin-exercises__field">
              <span className="sr-only">Pesquisar exercícios</span>
              <Search aria-hidden className="admin-exercises__fieldIcon" />
              <input
                className="neo-field"
                placeholder="Pesquisar por nome, grupo ou equipamento"
                value={filters.q}
                onChange={(event) => updateFilters({ q: event.target.value })}
              />
            </label>

            <label className="admin-exercises__field">
              <span className="admin-exercises__fieldLabel">Origem</span>
              <select
                className="neo-field"
                value={filters.scope}
                onChange={(event) => updateFilters({ scope: event.target.value as Filters['scope'] })}
              >
                <option value="all">Todos</option>
                <option value="global">Catálogo global</option>
                <option value="personal">Privados</option>
              </select>
            </label>

            <label className="admin-exercises__field">
              <span className="admin-exercises__fieldLabel">Estado</span>
              <select
                className="neo-field"
                value={filters.published}
                onChange={(event) => updateFilters({ published: event.target.value as Filters['published'] })}
              >
                <option value="all">Todos</option>
                <option value="published">Publicados</option>
                <option value="draft">Rascunho</option>
              </select>
            </label>

            <label className="admin-exercises__field">
              <span className="admin-exercises__fieldLabel">Dificuldade</span>
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

            <label className="admin-exercises__field">
              <span className="admin-exercises__fieldLabel">Grupo muscular</span>
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

            <label className="admin-exercises__field">
              <span className="admin-exercises__fieldLabel">Equipamento</span>
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

            <label className="admin-exercises__field">
              <span className="admin-exercises__fieldLabel">Intervalo</span>
              <select
                className="neo-field"
                value={filters.range}
                onChange={(event) => updateFilters({ range: event.target.value as Filters['range'] })}
              >
                <option value="30d">30 dias</option>
                <option value="90d">90 dias</option>
                <option value="180d">6 meses</option>
                <option value="365d">12 meses</option>
              </select>
            </label>

            <label className="admin-exercises__field">
              <span className="admin-exercises__fieldLabel">Ordenar por</span>
              <select
                className="neo-field"
                value={filters.sort}
                onChange={(event) => updateFilters({ sort: event.target.value as Filters['sort'] })}
              >
                <option value="created_desc">Mais recentes</option>
                <option value="updated_desc">Actualizados</option>
                <option value="name_asc">Nome (A-Z)</option>
              </select>
            </label>
          </div>

          <div className="admin-exercises__actions">
            <Button variant="ghost" leftIcon={<Filter aria-hidden />} onClick={resetFilters}>
              Limpar filtros
            </Button>
            <Button variant="ghost" leftIcon={<RefreshCcw aria-hidden />} loading={loading} onClick={refresh}>
              Actualizar
            </Button>
            <Button variant="ghost" leftIcon={<Printer aria-hidden />} onClick={printList}>
              Imprimir
            </Button>
            <Button variant="ghost" leftIcon={<Download aria-hidden />} onClick={exportCSV}>
              Exportar CSV
            </Button>
            <Button variant="primary" leftIcon={<Plus aria-hidden />} onClick={() => setCreateOpen(true)}>
              Novo exercício
            </Button>
          </div>
        </section>

        {message ? (
          <Alert tone={message.tone} title={message.text}>
            <button
              type="button"
              className="neo-alert__dismiss"
              onClick={() => setMessage(null)}
            >
              Fechar
            </button>
          </Alert>
        ) : null}

        <section className="neo-panel admin-exercises__panel" aria-label="Evolução do catálogo">
          <header className="neo-panel__header">
            <div>
              <h3 className="neo-panel__title">Evolução do catálogo</h3>
              <p className="neo-panel__subtitle">{RANGE_LABEL[filters.range]}</p>
            </div>
            <LineChart aria-hidden />
          </header>
          <div className="admin-exercises__chart">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dashboard.timeline} margin={{ top: 16, left: 0, right: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="chartPublished" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip content={<ExerciseTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="created" stroke="#1d4ed8" fill="url(#chartCreated)" strokeWidth={2} />
                <Area type="monotone" dataKey="published" stroke="#059669" fill="url(#chartPublished)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="admin-exercises__insights" aria-label="Distribuições e destaques">
          <DistributionList
            title="Dificuldades aplicadas"
            icon={<BarChart3 aria-hidden />}
            items={dashboard.difficulties}
            emptyLabel="Sem dados de dificuldade."
          />
          <DistributionList
            title="Grupos musculares"
            icon={<Layers aria-hidden />}
            items={dashboard.muscles}
            emptyLabel="Sem grupos musculares relevantes."
          />
          <DistributionList
            title="Equipamento utilizado"
            icon={<Tag aria-hidden />}
            items={dashboard.equipments}
            emptyLabel="Sem equipamento associado."
          />
        </section>

        <section className="admin-exercises__highlights" aria-label="Destaques">
          {dashboard.highlights.map((highlight) => (
            <HighlightCard key={highlight.id} highlight={highlight} />
          ))}
        </section>

        <section className="neo-panel admin-exercises__panel admin-exercises__table" aria-label="Lista de exercícios">
          <header className="neo-panel__header">
            <div>
              <h3 className="neo-panel__title">Exercícios disponíveis</h3>
              <p className="neo-panel__subtitle">
                {dashboard.table.total === 0
                  ? 'Sem resultados para os filtros seleccionados.'
                  : `A mostrar ${showingStart}-${showingEnd} de ${dashboard.table.total}`}
              </p>
            </div>
            <CalendarClock aria-hidden />
          </header>

          <div className="admin-exercises__tableWrapper">
            {paginatedRows.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Exercício</th>
                    <th>Grupo muscular</th>
                    <th>Equipamento</th>
                    <th>Dificuldade</th>
                    <th>Disponível para</th>
                    <th>Publicado</th>
                    <th>Actualizado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row) => {
                    const publication = resolvePublication(row);
                    return (
                      <tr key={row.id}>
                        <td>
                          <span className="admin-exercises__tableName">{row.name}</span>
                          {row.description ? (
                          <span className="admin-exercises__tableDescription">{row.description}</span>
                        ) : null}
                        <span className="admin-exercises__tableMeta">Criado por {row.creatorLabel}</span>
                      </td>
                      <td>
                        {row.muscleTags.length ? (
                          <ul className="admin-exercises__tags">
                            {row.muscleTags.map((tag) => (
                              <li key={`${row.id}-muscle-${tag}`}>{tag}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="admin-exercises__tableEmpty">—</span>
                        )}
                      </td>
                      <td>
                        {row.equipmentTags.length ? (
                          <ul className="admin-exercises__tags">
                            {row.equipmentTags.map((tag) => (
                              <li key={`${row.id}-equipment-${tag}`}>{tag}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="admin-exercises__tableEmpty">—</span>
                        )}
                      </td>
                      <td>
                        {row.difficulty ? (
                          <span className={clsx('admin-exercises__badge', row.difficulty.toLowerCase())}>{row.difficulty}</span>
                        ) : (
                          <span className="admin-exercises__tableEmpty">—</span>
                        )}
                      </td>
                      <td>{row.audienceLabel}</td>
                      <td>
                        {row.isGlobal ? (
                          <PublishToggle
                            id={row.id}
                            published={publication.isPublished}
                            onChange={handlePublishChange}
                          />
                        ) : (
                          <span className="admin-exercises__badge neutral">Privado</span>
                        )}
                      </td>
                      <td>{formatRelative(publication.updatedAt)}</td>
                      <td>
                        <div className="admin-exercises__tableActions">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit aria-hidden />}
                            onClick={() => {
                              router.push(`/dashboard/admin/exercises/${row.id}`);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<ArrowUpRight aria-hidden />}
                            onClick={() => {
                              setCloneRow(row);
                            }}
                          >
                            Duplicar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<Trash2 aria-hidden />}
                            onClick={() => handleDelete(row)}
                          >
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="neo-empty">
                <span className="neo-empty__icon" aria-hidden>
                  📦
                </span>
                <p className="neo-empty__title">Sem resultados</p>
                <p className="neo-empty__description">Ajusta os filtros ou cria um novo exercício.</p>
              </div>
            )}
          </div>

          {dashboard.table.total > filters.pageSize ? (
            <footer className="admin-exercises__pagination">
              <span>
                Página {filters.page + 1} de {totalPages}
              </span>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={filters.page === 0 || loading}
                  onClick={() => updateFilters({ page: Math.max(filters.page - 1, 0) }, { keepPage: true })}
                >
                  Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={filters.page + 1 >= totalPages || loading}
                  onClick={() => updateFilters({ page: Math.min(filters.page + 1, totalPages - 1) }, { keepPage: true })}
                >
                  Seguinte
                </Button>
              </div>
              <label className="admin-exercises__pageSize">
                <span>Tamanho da página</span>
                <select
                  className="neo-field"
                  value={filters.pageSize}
                  onChange={(event) => updateFilters({ pageSize: Number(event.target.value || 20), page: 0 })}
                >
                  {[10, 20, 50, 100].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </footer>
          ) : null}
        </section>
      </div>

      {createOpen ? (
        <div className="neo-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Criar exercício">
          <div className="neo-dialog admin-exercises__dialog" role="document">
            <header className="neo-dialog__header">
              <div>
                <h2 className="neo-dialog__title">Novo exercício</h2>
                <p className="neo-dialog__subtitle">Preenche os detalhes para disponibilizar no catálogo.</p>
              </div>
              <button
                type="button"
                className="btn"
                data-variant="ghost"
                data-size="sm"
                onClick={() => setCreateOpen(false)}
              >
                Fechar
              </button>
            </header>
            <div className="neo-dialog__content">
              <AdminExerciseFormClient
                mode="create"
                onSuccess={() => {
                  setCreateOpen(false);
                  startRefreshTransition(() => {
                    void mutate();
                  });
                }}
                onCancel={() => setCreateOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {cloneRow ? (
        <div className="neo-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Duplicar exercício">
          <div className="neo-dialog admin-exercises__dialog" role="document">
            <header className="neo-dialog__header">
              <div>
                <h2 className="neo-dialog__title">Duplicar exercício</h2>
                <p className="neo-dialog__subtitle">Cria uma nova entrada com base no exercício seleccionado.</p>
              </div>
              <button
                type="button"
                className="btn"
                data-variant="ghost"
                data-size="sm"
                onClick={() => setCloneRow(null)}
              >
                Fechar
              </button>
            </header>
            <div className="neo-dialog__content">
              <AdminExerciseFormClient
                mode="create"
                initial={mapCloneInitial(cloneRow)}
                onSuccess={() => {
                  setCloneRow(null);
                  startRefreshTransition(() => {
                    void mutate();
                  });
                }}
                onCancel={() => setCloneRow(null)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
