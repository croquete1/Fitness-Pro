'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  Download,
  Filter,
  Loader2,
  Plus,
  Printer,
  RefreshCcw,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import clsx from 'clsx';

import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';

type PlanRow = {
  id: string;
  name: string;
  description?: string | null;
  difficulty?: string | null;
  duration_weeks?: number | null;
  is_public?: boolean | null;
  created_at?: string | null;
};

type PlansResponse = {
  rows: PlanRow[];
  count: number;
  source?: 'supabase' | 'fallback';
  _supabaseConfigured?: boolean;
};

type DifficultyStat = { key: string; count: number };

type InsightsResponse = {
  ok: true;
  source: 'supabase' | 'fallback';
  total: number;
  publicCount: number;
  privateCount: number;
  averageDurationWeeks: number | null;
  medianDurationWeeks: number | null;
  latestUpdate: string | null;
  createdThisMonth: number;
  difficulties: DifficultyStat[];
  sampleSize: number;
  datasetSize: number;
  _supabaseConfigured?: boolean;
};

type Feedback = { message: string; tone: 'info' | 'success' | 'warning' | 'danger' } | null;

type UndoState = { row: PlanRow | null; busy: boolean };

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

function formatWeeks(value: number | null | undefined) {
  if (!value || Number.isNaN(Number(value))) return '—';
  if (value === 1) return '1 semana';
  return `${value} semanas`;
}

function formatRelative(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const days = Math.round(diffMs / 86_400_000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;
  const months = Math.round(days / 30);
  if (months < 12) return `há ${months} mês${months === 1 ? '' : 'es'}`;
  const years = Math.round(months / 12);
  return `há ${years} ano${years === 1 ? '' : 's'}`;
}

function toCsvValue(value: unknown) {
  const raw = value == null ? '' : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

function buildCsv(rows: PlanRow[]) {
  const header = ['id', 'name', 'difficulty', 'duration_weeks', 'is_public', 'created_at', 'description'];
  const body = rows.map((row) => [
    row.id,
    row.name,
    row.difficulty ?? '',
    row.duration_weeks ?? '',
    row.is_public ? 'true' : 'false',
    row.created_at ?? '',
    (row.description ?? '').replace(/\r?\n/g, ' '),
  ].map(toCsvValue).join(','));
  return [header.join(','), ...body].join('\n');
}

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function difficultyToken(value: string | null | undefined) {
  if (!value) return 'nao-definido';
  const trimmed = value.trim();
  if (!trimmed) return 'nao-definido';
  const normalised = stripDiacritics(trimmed).toLowerCase();
  if (normalised === 'all' || normalised === 'todas') return 'all';
  if (normalised.includes('inic')) return 'iniciante';
  if (normalised.includes('inter')) return 'intermedio';
  if (normalised.includes('avan')) return 'avancado';
  if (normalised.includes('esp')) return 'especializado';
  if (normalised.includes('nao') || normalised.includes('indefi') || normalised.includes('undefined')) {
    return 'nao-definido';
  }
  return normalised.replace(/[^a-z0-9]+/g, '-');
}

function formatDifficulty(value: string | null | undefined) {
  const token = difficultyToken(value);
  if (token === 'all') return 'Todas';
  switch (token) {
    case 'iniciante':
      return 'Iniciante';
    case 'intermedio':
      return 'Intermédio';
    case 'avancado':
      return 'Avançado';
    case 'especializado':
      return 'Especializado';
    case 'nao-definido':
      return 'Não definido';
    default: {
      if (typeof value === 'string') {
        const label = value.trim();
        if (label) return label.charAt(0).toUpperCase() + label.slice(1);
      }
      return 'Não definido';
    }
  }
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function PlansClient() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('all');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [rows, setRows] = React.useState<PlanRow[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback>(null);
  const [undo, setUndo] = React.useState<UndoState>({ row: null, busy: false });
  const undoTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [insights, setInsights] = React.useState<InsightsResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = React.useState(false);
  const [insightsError, setInsightsError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [listHydrated, setListHydrated] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [cloneBusyIds, setCloneBusyIds] = React.useState<Set<string>>(() => new Set());
  const cloneBusyRef = React.useRef<Set<string>>(new Set());

  const supabaseOnline = insights?.source === 'supabase' && insights?._supabaseConfigured !== false;

  const markCloneBusy = React.useCallback((id: string, busy: boolean) => {
    setCloneBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) {
        next.add(id);
      } else {
        next.delete(id);
      }
      cloneBusyRef.current = next;
      return next;
    });
  }, []);

  React.useEffect(() => {
    cloneBusyRef.current = cloneBusyIds;
  }, [cloneBusyIds]);

  React.useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setListHydrated(false);
      setListError(null);
      try {
        const url = new URL('/api/admin/plans', window.location.origin);
        url.searchParams.set('page', String(page));
        url.searchParams.set('pageSize', String(pageSize));
        if (debouncedQuery) url.searchParams.set('q', debouncedQuery);
        if (difficulty !== 'all') url.searchParams.set('difficulty', formatDifficulty(difficulty));
        const response = await fetch(url.toString(), { cache: 'no-store', signal: controller.signal });
        if (!response.ok) {
          throw new Error(await response.text().catch(() => 'Falha ao carregar os planos.'));
        }
        const json = (await response.json()) as PlansResponse;
        setRows((json.rows ?? []).map((row) => ({ ...row, id: String(row.id) })));
        setCount(json.count ?? 0);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn('[admin/plans] list failed', error);
        setListError(error instanceof Error ? error.message : 'Falha ao carregar os planos.');
        setRows([]);
        setCount(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setListHydrated(true);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [page, pageSize, debouncedQuery, difficulty, refreshKey]);

  React.useEffect(() => {
    const controller = new AbortController();
    async function loadInsights() {
      setInsightsLoading(true);
      setInsightsError(null);
      try {
        const response = await fetch('/api/admin/plans/insights', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) {
          throw new Error(await response.text().catch(() => 'Falha ao carregar métricas.'));
        }
        const json = (await response.json()) as InsightsResponse;
        if (json.ok !== true) throw new Error('Resposta inválida do servidor.');
        setInsights(json);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn('[admin/plans] insights failed', error);
        setInsightsError(error instanceof Error ? error.message : 'Falha ao carregar métricas.');
        setInsights(null);
      } finally {
        if (!controller.signal.aborted) setInsightsLoading(false);
      }
    }
    void loadInsights();
    return () => controller.abort();
  }, [refreshKey]);

  const difficultyOptions = React.useMemo(() => {
    const options = new Map<string, string>();
    rows.forEach((row) => {
      if (row.difficulty) {
        const token = difficultyToken(row.difficulty);
        options.set(token, formatDifficulty(row.difficulty));
      }
    });
    insights?.difficulties.forEach((stat) => {
      const token = difficultyToken(stat.key);
      options.set(token, formatDifficulty(stat.key));
    });
    if (difficulty !== 'all' && difficulty.trim()) {
      const token = difficultyToken(difficulty);
      options.set(token, formatDifficulty(difficulty));
    }
    return Array.from(options.values())
      .sort((a, b) => a.localeCompare(b, 'pt-PT'));
  }, [rows, insights, difficulty]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  React.useEffect(() => {
    if (!ready || !listHydrated) return;
    if (page !== currentPage) setPage(currentPage);
  }, [ready, listHydrated, currentPage, page]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  React.useEffect(() => {
    if (!ready) return;
    setPage(0);
  }, [ready, debouncedQuery, difficulty, pageSize]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    function applySearchParams(search: URLSearchParams) {
      const nextQuery = search.get('q') ?? '';
      const nextDifficulty = search.get('difficulty') ?? 'all';
      const nextPage = Number.parseInt(search.get('page') ?? '0', 10);
      const nextPageSize = Number.parseInt(search.get('pageSize') ?? '20', 10);

      setQuery((prev) => (prev === nextQuery ? prev : nextQuery));
      setDebouncedQuery(nextQuery.trim());
      setDifficulty((prev) => {
        if (!nextDifficulty || nextDifficulty === 'all') return prev === 'all' ? prev : 'all';
        const value = formatDifficulty(nextDifficulty);
        return prev === value ? prev : value;
      });
      setPage((prev) => {
        const parsed = Number.isFinite(nextPage) && nextPage >= 0 ? nextPage : 0;
        return prev === parsed ? prev : parsed;
      });
      setPageSize((prev) => {
        const parsed = Number.isFinite(nextPageSize) && PAGE_SIZE_OPTIONS.includes(nextPageSize)
          ? nextPageSize
          : 20;
        return prev === parsed ? prev : parsed;
      });
    }

    const initial = new URLSearchParams(window.location.search);
    applySearchParams(initial);
    setReady(true);

    const onPopState = () => {
      applySearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  React.useEffect(() => {
    if (!ready || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const search = url.searchParams;
    if (debouncedQuery) {
      search.set('q', debouncedQuery);
    } else {
      search.delete('q');
    }
    if (difficulty !== 'all') {
      search.set('difficulty', difficultyToken(difficulty));
    } else {
      search.delete('difficulty');
    }
    if (page > 0) {
      search.set('page', String(page));
    } else {
      search.delete('page');
    }
    if (pageSize !== 20) {
      search.set('pageSize', String(pageSize));
    } else {
      search.delete('pageSize');
    }

    const next = `${url.pathname}${search.toString() ? `?${search.toString()}` : ''}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) {
      window.history.replaceState(window.history.state, '', next);
    }
  }, [ready, debouncedQuery, difficulty, page, pageSize]);

  React.useEffect(() => {
    if (!feedback) return;
    const handle = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(handle);
  }, [feedback]);

  function handleExport() {
    const csv = buildCsv(rows.map((row) => ({
      ...row,
      difficulty: formatDifficulty(row.difficulty ?? ''),
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const diffSlug = difficulty !== 'all' ? difficultyToken(difficulty) : null;
    const querySlug = debouncedQuery ? stripDiacritics(debouncedQuery).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') : '';
    const name = `planos${diffSlug ? `-diff-${diffSlug}` : ''}${querySlug ? `-q-${querySlug}` : ''}.csv`;
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    setFeedback({ tone: 'success', message: 'Exportação preparada com sucesso.' });
  }

  function handlePrint() {
    const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=720');
    if (!win) return;
    const rowsHtml = rows
      .map((row) => {
        const values = [
          row.name,
          formatDifficulty(row.difficulty),
          formatWeeks(row.duration_weeks ?? null),
          row.is_public ? 'Sim' : 'Não',
          formatDate(row.created_at ?? null),
          (row.description ?? '').replace(/\r?\n/g, ' '),
        ]
          .map((value) => `<td>${String(value)}</td>`)
          .join('');
        return `<tr>${values}</tr>`;
      })
      .join('');
    const documentHtml = `<!doctype html><html><head><meta charset="utf-8"/><title>Lista de planos</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px;background:#fff;color:#111}h1{font-size:20px;margin:0 0 16px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #cbd5f5;padding:8px;text-align:left}th{background:#eef2ff;font-weight:600}</style></head><body><h1>Planos activos</h1><table><thead><tr><th>Nome</th><th>Dificuldade</th><th>Duração</th><th>Público</th><th>Criado</th><th>Descrição</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=()=>window.print();</script></body></html>`;
    win.document.open();
    win.document.write(documentHtml);
    win.document.close();
  }

  async function handleClone(id: string) {
    try {
      if (cloneBusyRef.current.has(id)) return;
      markCloneBusy(id, true);
      const response = await fetch(`/api/admin/plans/${id}/clone`, { method: 'POST' });
      if (!response.ok) throw new Error(await response.text().catch(() => 'Falha ao clonar o plano.'));
      setFeedback({ tone: 'success', message: 'Plano clonado com sucesso.' });
      setCount((value) => value + 1);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      console.warn('[admin/plans] clone failed', error);
      setFeedback({ tone: 'danger', message: error instanceof Error ? error.message : 'Falha ao clonar o plano.' });
    } finally {
      markCloneBusy(id, false);
    }
  }

  async function handleDelete(row: PlanRow) {
    if (!confirm(`Remover plano "${row.name}"?`)) return;
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    setUndo({ row, busy: false });
    setCount((value) => Math.max(0, value - 1));
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo({ row: null, busy: false }), 5000);

    try {
      const response = await fetch(`/api/admin/plans/${row.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await response.text().catch(() => 'Falha ao remover o plano.'));
      setFeedback({ tone: 'info', message: 'Plano removido. Tens 5 segundos para desfazer.' });
    } catch (error) {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      setRows((prev) => [row, ...prev]);
      setCount((value) => value + 1);
      setUndo({ row: null, busy: false });
      console.warn('[admin/plans] delete failed', error);
      setFeedback({ tone: 'danger', message: error instanceof Error ? error.message : 'Falha ao remover o plano.' });
    }
  }

  async function handleUndo() {
    if (!undo.row) return;
    setUndo((prev) => ({ ...prev, busy: true }));
    try {
      const payload = {
        name: undo.row.name,
        description: undo.row.description ?? null,
        difficulty: undo.row.difficulty ?? null,
        duration_weeks: undo.row.duration_weeks ?? null,
        is_public: undo.row.is_public ?? false,
      };
      const response = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text().catch(() => 'Falha ao restaurar o plano.'));
      setFeedback({ tone: 'success', message: 'Plano restaurado.' });
      setCount((value) => value + 1);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      console.warn('[admin/plans] undo failed', error);
      setFeedback({ tone: 'danger', message: error instanceof Error ? error.message : 'Falha ao restaurar o plano.' });
    } finally {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      setUndo({ row: null, busy: false });
    }
  }

  const handleRefresh = React.useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  const activeFilters = React.useMemo(() => {
    const filters: string[] = [];
    if (debouncedQuery) filters.push(`pesquisa "${debouncedQuery}"`);
    if (difficulty !== 'all') filters.push(`dificuldade ${formatDifficulty(difficulty)}`);
    return filters;
  }, [debouncedQuery, difficulty]);

  const filtersDescription = React.useMemo(() => {
    if (!activeFilters.length) return '';
    if (activeFilters.length === 1) return activeFilters[0];
    const head = activeFilters.slice(0, -1).join(', ');
    const tail = activeFilters[activeFilters.length - 1];
    return `${head} e ${tail}`;
  }, [activeFilters]);

  const filtersSummary = React.useMemo(() => {
    if (!activeFilters.length) return 'Sem filtros activos.';
    return `Filtros activos: ${filtersDescription}.`;
  }, [activeFilters, filtersDescription]);

  const listSummary = React.useMemo(() => {
    if (loading) return 'A carregar planos…';
    if (!rows.length) {
      if (!activeFilters.length) return 'Nenhum plano encontrado.';
      return `Nenhum plano encontrado para ${filtersDescription}.`;
    }
    const visible = numberFormatter.format(rows.length);
    const total = numberFormatter.format(count);
    const base = `A mostrar ${visible} de ${total} planos`;
    return activeFilters.length ? `${base} filtrados por ${filtersDescription}.` : `${base}.`;
  }, [loading, rows.length, count, activeFilters, filtersDescription]);

  return (
    <div className="admin-plans neo-stack neo-stack--xl">
      <section className="neo-panel admin-plans__hero" aria-label="Resumo dos planos">
        <header className="neo-panel__header">
          <div>
            <h1 className="neo-panel__title">Planos de treino</h1>
            <p className="neo-panel__subtitle">
              Gestão centralizada dos planos activos, com métricas reais e controlos rápidos.
            </p>
          </div>
          <div className="admin-plans__status" role="status">
            <span className="status-pill" data-state={supabaseOnline ? 'ok' : 'warn'}>
              {supabaseOnline ? 'Ligação activa ao servidor' : 'Modo offline'}
            </span>
            {insights?.latestUpdate && (
              <span className="admin-plans__statusHint">
                Última actualização {formatRelative(insights.latestUpdate)}
              </span>
            )}
          </div>
        </header>

        <div className="admin-plans__metrics" role="list">
          <article className="admin-plans__metric" role="listitem">
            <span className="admin-plans__metricLabel">Planos activos</span>
            <strong className="admin-plans__metricValue">
              {insightsLoading ? <Spinner size={18} /> : numberFormatter.format(insights?.total ?? count)}
            </strong>
            <span className="admin-plans__metricHint">no catálogo</span>
          </article>
          <article className="admin-plans__metric" role="listitem">
            <span className="admin-plans__metricLabel">Visibilidade</span>
            <strong className="admin-plans__metricValue">
              {insightsLoading ? (
                <Spinner size={18} />
              ) : (
                <span className="admin-plans__metricSplit">
                  <span data-state="public">{numberFormatter.format(insights?.publicCount ?? 0)} públicos</span>
                  <span data-state="private">{numberFormatter.format(insights?.privateCount ?? 0)} privados</span>
                </span>
              )}
            </strong>
            <span className="admin-plans__metricHint">baseado em dados reais</span>
          </article>
          <article className="admin-plans__metric" role="listitem">
            <span className="admin-plans__metricLabel">Duração média</span>
            <strong className="admin-plans__metricValue">
              {insightsLoading
                ? <Spinner size={18} />
                : insights?.averageDurationWeeks != null
                  ? `${insights.averageDurationWeeks} sem`
                  : '—'}
            </strong>
            <span className="admin-plans__metricHint">mediana {insights?.medianDurationWeeks ?? '—'} sem</span>
          </article>
          <article className="admin-plans__metric" role="listitem">
            <span className="admin-plans__metricLabel">Novos este mês</span>
            <strong className="admin-plans__metricValue">
              {insightsLoading ? <Spinner size={18} /> : numberFormatter.format(insights?.createdThisMonth ?? 0)}
            </strong>
            <span className="admin-plans__metricHint">dados do servidor</span>
          </article>
        </div>

        <footer className="admin-plans__heroFooter">
          <div className="admin-plans__distribution" aria-label="Distribuição por dificuldade">
            <header>
              <BarChart3 aria-hidden />
              <span>Distribuição por dificuldade</span>
            </header>
            <ul>
              {(insights?.difficulties ?? []).map((stat) => (
                <li key={stat.key}>
                  <span className="admin-plans__distributionLabel">{formatDifficulty(stat.key)}</span>
                  <span className="admin-plans__distributionBar">
                    <span
                      aria-hidden
                      style={{ width: `${Math.min(100, (stat.count / Math.max(insights?.sampleSize || 1, 1)) * 100)}%` }}
                    />
                    <span className="admin-plans__distributionValue">{stat.count}</span>
                  </span>
                </li>
              ))}
              {!insightsLoading && !insights?.difficulties?.length && (
                <li className="admin-plans__distributionEmpty">Sem dados suficientes</li>
              )}
            </ul>
          </div>
          <div className="admin-plans__heroActions">
            <Button
              variant="secondary"
              leftIcon={<RefreshCcw size={16} aria-hidden />}
              onClick={handleRefresh}
            >
              Actualizar dados
            </Button>
            <Button
              leftIcon={<Plus size={16} aria-hidden />}
              onClick={() => router.push('/dashboard/admin/plans/new')}
            >
              Novo plano
            </Button>
          </div>
        </footer>
      </section>

      <section className="neo-panel admin-plans__controls" aria-label="Filtros e exportação">
        <div className="admin-plans__filters" role="group" aria-label="Filtros">
          <label className="neo-input-group admin-plans__filter">
            <span className="neo-input-group__label">Pesquisar</span>
            <span className="neo-input-group__field">
              <input
                className="neo-input"
                type="search"
                placeholder="Nome ou descrição"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Filter size={16} aria-hidden />
            </span>
          </label>
          <label className="neo-input-group admin-plans__filter">
            <span className="neo-input-group__label">Dificuldade</span>
            <select
              className="neo-input"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="all">Todas</option>
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="neo-input-group admin-plans__filter admin-plans__filter--compact">
            <span className="neo-input-group__label">Por página</span>
            <select
              className="neo-input"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="admin-plans__toolbar">
          <Button
            variant="secondary"
            leftIcon={<Download size={16} aria-hidden />}
            onClick={handleExport}
            disabled={!rows.length}
          >
            Exportar CSV
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Printer size={16} aria-hidden />}
            onClick={handlePrint}
            disabled={!rows.length}
          >
            Imprimir
          </Button>
        </div>
        <p className="admin-plans__filtersSummary" aria-live="polite">{filtersSummary}</p>
      </section>

      {feedback && (
        <Alert
          tone={feedback.tone}
          className="admin-plans__feedback"
          role="alert"
          onAnimationEnd={() => undefined}
        >
          {feedback.message}
        </Alert>
      )}

      {listError && (
        <Alert tone="danger" role="alert" className="admin-plans__feedback">
          {listError}
        </Alert>
      )}

      {insightsError && (
        <Alert tone="warning" role="alert" className="admin-plans__feedback">
          {insightsError}
        </Alert>
      )}

      <section className={clsx('neo-panel admin-plans__tablePanel', loading && 'is-loading')} aria-live="polite">
        <header className="admin-plans__tableHeader">
          <div>
            <h2>Lista de planos</h2>
            <p className="admin-plans__tableSummary" aria-live="polite">{listSummary}</p>
          </div>
          <Button
            variant="ghost"
            leftIcon={<RefreshCcw size={16} aria-hidden />}
            onClick={handleRefresh}
            loading={loading}
          >
            Recarregar
          </Button>
        </header>

        <div className={clsx('neo-table-wrapper', loading && 'is-loading')}>
          <table className="neo-table admin-plans__table">
            <thead>
              <tr>
                <th scope="col">Plano</th>
                <th scope="col">Dificuldade</th>
                <th scope="col" className="neo-table__cell--right">Duração</th>
                <th scope="col">Visibilidade</th>
                <th scope="col">Criado em</th>
                <th scope="col" className="neo-table__actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="admin-plans__name">
                      <span className="admin-plans__nameText">{row.name}</span>
                      {row.description && (
                        <span className="admin-plans__description">{row.description}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="admin-plans__difficulty" data-tone={difficultyToken(row.difficulty)}>
                      {formatDifficulty(row.difficulty)}
                    </span>
                  </td>
                  <td className="neo-table__cell--right">{formatWeeks(row.duration_weeks)}</td>
                  <td>
                    <span
                      className="admin-plans__visibility"
                      data-state={row.is_public ? 'public' : 'private'}
                    >
                      {row.is_public ? (
                        <>
                          <ShieldCheck size={14} aria-hidden /> Público
                        </>
                      ) : (
                        <>
                          <ShieldOff size={14} aria-hidden /> Privado
                        </>
                      )}
                    </span>
                  </td>
                  <td>{formatDate(row.created_at)}</td>
                  <td className="neo-table__actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/admin/plans/${row.id}`)}
                      leftIcon={<ArrowRight size={14} aria-hidden />}
                    >
                      Abrir
                    </Button>
                    <button
                      type="button"
                      className="neo-icon-button"
                      aria-label={`Clonar plano ${row.name}`}
                      onClick={() => handleClone(row.id)}
                      disabled={cloneBusyIds.has(row.id)}
                    >
                      <span aria-hidden>
                        {cloneBusyIds.has(row.id) ? <Loader2 className="neo-spin" size={14} /> : '⧉'}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="neo-icon-button"
                      aria-label={`Remover plano ${row.name}`}
                      onClick={() => handleDelete(row)}
                    >
                      <span aria-hidden>🗑</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-table-empty">
                      <p>Nenhum plano encontrado com os filtros actuais.</p>
                      <Button variant="secondary" onClick={() => { setQuery(''); setDifficulty('all'); }}>
                        Limpar filtros
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <div className="neo-table__loading">
              <Loader2 className="neo-spin" size={20} aria-hidden />
              <span>A carregar planos…</span>
            </div>
          )}
        </div>

        <footer className="admin-plans__pagination" aria-label="Paginação">
          <div>
            Página {currentPage + 1} de {totalPages}
          </div>
          <div className="admin-plans__paginationControls">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={currentPage <= 0}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Seguinte
            </Button>
          </div>
        </footer>
      </section>

      {undo.row && (
        <Alert tone="info" role="alert" className="admin-plans__undo">
          Plano removido. <button type="button" onClick={handleUndo} disabled={undo.busy}>Desfazer</button>
        </Alert>
      )}
    </div>
  );
}
