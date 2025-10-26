'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarClock, RefreshCcw, Sparkles, UserPlus2, Users2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

type StatusFilter = '' | 'active' | 'onboarding' | 'paused';
type ShiftFilter = '' | 'manhã' | 'tarde' | 'noite';

type Assignment = {
  id: string;
  trainer_id: string;
  trainer_name: string | null;
  trainer_focus: string | null;
  status: string | null;
  shift: string | null;
  clients_count: number | null;
  highlighted_client_id: string | null;
  highlighted_client_name: string | null;
  next_check_in_at: string | null;
  load_level: string | null;
  tags: string[] | null;
  last_synced_at: string | null;
};

type TimelineItem = {
  id: string;
  assignment_id: string | null;
  owner_id: string | null;
  owner_name: string | null;
  title: string | null;
  detail: string | null;
  scheduled_at: string | null;
};

type TimelineEntry = {
  item: TimelineItem;
  tone: 'info' | 'warning' | 'danger';
  urgency: string | null;
  ownerLabel: string;
  ownerMissing: boolean;
  assignmentLabel: string | null;
  timestamp: number | null;
  when: string;
};

type ApiResponse = {
  assignments?: Assignment[];
  timeline?: TimelineItem[];
  count?: number;
  error?: string;
  _supabaseConfigured?: boolean;
};

type MetricTone = 'primary' | 'success' | 'warning' | 'neutral' | 'info';

type Banner = { message: string; tone: 'info' | 'warning' | 'danger' };

type TimelineScope = 'all' | 'overdue' | 'next24h' | 'unassigned';

const shiftOptions: Array<{ value: ShiftFilter; label: string }> = [
  { value: '', label: 'Todos os turnos' },
  { value: 'manhã', label: 'Turno da manhã' },
  { value: 'tarde', label: 'Turno da tarde' },
  { value: 'noite', label: 'Turno noite' },
];

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: '', label: 'Todos os estados' },
  { value: 'active', label: 'Operacionais' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'paused', label: 'Em pausa' },
];

function toneForStatus(status: string | null | undefined): 'success' | 'warning' | 'neutral' | 'info' {
  const value = status?.toLowerCase();
  if (value === 'active') return 'success';
  if (value === 'onboarding') return 'warning';
  if (value === 'paused') return 'neutral';
  return 'info';
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return '—';
    const diff = Date.now() - ts;
    const minutes = Math.round(diff / 60_000);
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `há ${hours} h`;
    const days = Math.round(hours / 24);
    if (days < 30) return `há ${days} dia${days === 1 ? '' : 's'}`;
    const months = Math.round(days / 30);
    if (months < 12) return `há ${months} mês${months === 1 ? '' : 'es'}`;
    const years = Math.round(months / 12);
    return `há ${years} ano${years === 1 ? '' : 's'}`;
  } catch {
    return '—';
  }
}

function formatCheckIn(iso: string | null | undefined): string {
  if (!iso) return 'A definir';
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    let dayLabel = date
      .toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })
      .replace('.', '')
      .toUpperCase();

    if (isSameDay(date, today)) {
      dayLabel = 'Hoje';
    } else if (isSameDay(date, tomorrow)) {
      dayLabel = 'Amanhã';
    }

    const time = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    return `${dayLabel} · ${time}`;
  } catch {
    return iso ?? 'A definir';
  }
}

function describeLastSync(timestamp: number | null): string {
  if (!timestamp) return 'Aguardando primeira sincronização';
  const relative = formatRelative(new Date(timestamp).toISOString());
  if (relative === '—') return 'Actualizado há instantes';
  if (relative === 'agora mesmo') return 'Actualizado agora mesmo';
  return `Actualizado ${relative}`;
}

function getTimelineTimestamp(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const value = Date.parse(iso);
  return Number.isNaN(value) ? null : value;
}

function deriveTimelineTone(iso: string | null | undefined): 'info' | 'warning' | 'danger' {
  if (!iso) return 'warning';
  const timestamp = getTimelineTimestamp(iso);
  if (timestamp === null) return 'info';
  const diff = timestamp - Date.now();
  if (diff < 0) return 'danger';
  if (diff <= 60 * 60_000) return 'warning';
  return 'info';
}

function describeTimelineUrgency(iso: string | null | undefined): string | null {
  if (!iso) return 'Agendamento por definir';
  const timestamp = getTimelineTimestamp(iso);
  if (timestamp === null) return null;
  const diff = timestamp - Date.now();
  if (Math.abs(diff) < 60_000) {
    return diff < 0 ? 'Em acompanhamento agora' : 'A iniciar agora';
  }

  const minuteDiff = Math.max(1, Math.round(Math.abs(diff) / 60_000));

  if (diff < 0) {
    if (minuteDiff < 60) return `Atrasado ${minuteDiff} min`;
    const hours = Math.max(1, Math.round(minuteDiff / 60));
    if (hours < 24) return `Atrasado ${hours} h`;
    const days = Math.max(1, Math.round(hours / 24));
    return `Atrasado ${days} dia${days === 1 ? '' : 's'}`;
  }

  if (minuteDiff < 60) return `Começa em ${minuteDiff} min`;
  const hours = Math.max(1, Math.round(minuteDiff / 60));
  if (hours < 24) return `Começa em ${hours} h`;
  const days = Math.max(1, Math.round(hours / 24));
  return `Começa em ${days} dia${days === 1 ? '' : 's'}`;
}

export default function RosterClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('');
  const [shift, setShift] = React.useState<ShiftFilter>('');
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [timeline, setTimeline] = React.useState<TimelineItem[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastFetchedAt, setLastFetchedAt] = React.useState<number | null>(null);
  const [banner, setBanner] = React.useState<Banner | null>(null);
  const [timelineFilter, setTimelineFilter] = React.useState<TimelineScope>('all');
  const [nowTick, setNowTick] = React.useState(() => Date.now());
  const inFlightRef = React.useRef<AbortController | null>(null);
  const searchParamsSnapshotRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handle = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearch((previous) => {
        if (previous === trimmed) {
          return previous;
        }
        return trimmed;
      });
    }, 300);

    return () => {
      window.clearTimeout(handle);
    };
  }, [searchInput]);

  const fetchRoster = React.useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;
    const params = new URLSearchParams();
    const trimmed = search.trim();
    if (trimmed) params.set('q', trimmed);
    if (status) params.set('status', status);
    if (shift) params.set('shift', shift);

    inFlightRef.current?.abort();
    const controller = new AbortController();
    inFlightRef.current = controller;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/admin/roster?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      });

      if (response.status === 401 || response.status === 403) {
        setAssignments([]);
        setTimeline([]);
        setCount(0);
        setBanner({ tone: 'warning', message: 'Sessão expirada — autentica-te novamente para veres a escala real.' });
        setLastFetchedAt(Date.now());
        return;
      }

      if (!response.ok) {
        throw new Error((await response.text()) || 'Falha ao carregar escala.');
      }

      const payload = (await response.json()) as ApiResponse;

      setAssignments(payload.assignments ?? []);
      setTimeline(payload.timeline ?? []);
      setCount(payload.count ?? (payload.assignments ?? []).length);
      setLastFetchedAt(Date.now());

      if (payload._supabaseConfigured === false) {
        setBanner({ tone: 'info', message: 'Servidor ainda não está ligado — sem dados de escala disponíveis.' });
      } else if (payload.error) {
        setBanner({ tone: 'warning', message: 'Algumas entradas podem estar temporariamente indisponíveis.' });
      } else {
        setBanner(null);
      }
    } catch (error: any) {
      if (controller.signal.aborted) {
        return;
      }

      setAssignments([]);
      setTimeline([]);
      setCount(0);
      setBanner({ tone: 'danger', message: error?.message || 'Não foi possível sincronizar a escala.' });
      setLastFetchedAt(Date.now());
    } finally {
      if (!controller.signal.aborted) {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
  }, [search, status, shift]);

  React.useEffect(() => {
    void fetchRoster();
  }, [fetchRoster]);

  React.useEffect(() => () => {
    inFlightRef.current?.abort();
  }, []);

  React.useEffect(() => {
    const paramsText = searchParams?.toString() ?? '';
    if (searchParamsSnapshotRef.current === paramsText) {
      return;
    }
    searchParamsSnapshotRef.current = paramsText;

    const nextSearch = searchParams?.get('q') ?? '';
    const nextStatusParam = (searchParams?.get('status') ?? '') as StatusFilter;
    const nextShiftParam = (searchParams?.get('shift') ?? '') as ShiftFilter;
    const validStatus = statusOptions.some((option) => option.value === nextStatusParam) ? nextStatusParam : '';
    const validShift = shiftOptions.some((option) => option.value === nextShiftParam) ? nextShiftParam : '';

    setSearchInput((current) => (current === nextSearch ? current : nextSearch));
    setSearch((current) => (current === nextSearch ? current : nextSearch));
    setStatus((current) => (current === validStatus ? current : validStatus));
    setShift((current) => (current === validShift ? current : validShift));
  }, [searchParams]);

  React.useEffect(() => {
    if (searchParamsSnapshotRef.current === null) {
      return;
    }

    const current = new URLSearchParams(searchParamsSnapshotRef.current);
    const trimmedSearch = search.trim();
    let changed = false;

    const applyParam = (key: string, value: string) => {
      if (value) {
        if (current.get(key) !== value) {
          current.set(key, value);
          changed = true;
        }
      } else if (current.has(key)) {
        current.delete(key);
        changed = true;
      }
    };

    applyParam('q', trimmedSearch);
    applyParam('status', status);
    applyParam('shift', shift);

    if (changed) {
      const query = current.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [search, status, shift, router, pathname]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const tick = () => {
      void fetchRoster({ silent: true });
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    }, 60_000);

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchRoster]);

  const metrics = React.useMemo(() => {
    const trainers = new Set<string>();
    let totalClients = 0;
    let onboarding = 0;
    let paused = 0;
    let active = 0;

    assignments.forEach((assignment) => {
      const trainer = assignment.trainer_name ?? assignment.trainer_id;
      if (trainer) trainers.add(trainer);
      totalClients += assignment.clients_count ?? 0;

      const statusValue = assignment.status?.toLowerCase();
      if (statusValue === 'active') active += 1;
      if (statusValue === 'onboarding') onboarding += 1;
      if (statusValue === 'paused') paused += 1;
    });

    return {
      trainers: trainers.size,
      clients: totalClients,
      active,
      onboarding,
      paused,
    };
  }, [assignments]);

  const assignmentsById = React.useMemo(() => {
    const map = new Map<string, Assignment>();
    assignments.forEach((assignment) => {
      map.set(assignment.id, assignment);
    });
    return map;
  }, [assignments]);

  const sortedTimeline = React.useMemo(() => {
    return [...timeline].sort((a, b) => {
      const aTime = getTimelineTimestamp(a.scheduled_at) ?? Number.POSITIVE_INFINITY;
      const bTime = getTimelineTimestamp(b.scheduled_at) ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
  }, [timeline]);

  const timelineEntries = React.useMemo((): TimelineEntry[] => {
    return sortedTimeline.map((item) => {
      const tone = deriveTimelineTone(item.scheduled_at);
      const urgency = describeTimelineUrgency(item.scheduled_at);
      const timestamp = getTimelineTimestamp(item.scheduled_at);
      const relatedAssignment = item.assignment_id ? assignmentsById.get(item.assignment_id) : undefined;
      const assignmentTrainer = relatedAssignment?.trainer_name ?? relatedAssignment?.trainer_id ?? null;
      const ownerMissing = !item.owner_name;
      const ownerLabel = ownerMissing ? 'Responsável por atribuir' : `Responsável · ${item.owner_name}`;
      const showAssignment = Boolean(assignmentTrainer && (ownerMissing || assignmentTrainer !== item.owner_name));
      const assignmentLabel = showAssignment ? `Atribuição · ${assignmentTrainer}` : null;

      return {
        item,
        tone,
        urgency,
        ownerLabel,
        ownerMissing,
        assignmentLabel,
        timestamp,
        when: formatCheckIn(item.scheduled_at),
      } satisfies TimelineEntry;
    });
  }, [sortedTimeline, assignmentsById]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      setNowTick(Date.now());
      return;
    }

    setNowTick(Date.now());

    if (timelineEntries.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setNowTick(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [timelineEntries.length]);

  const timelineCounts = React.useMemo(() => {
    const now = nowTick;
    const next24h = now + 24 * 60 * 60_000;
    let overdue = 0;
    let upcoming24h = 0;
    let unassigned = 0;

    timelineEntries.forEach((entry) => {
      if (entry.timestamp !== null) {
        if (entry.timestamp < now) {
          overdue += 1;
        } else if (entry.timestamp <= next24h) {
          upcoming24h += 1;
        }
      }

      if (entry.ownerMissing) {
        unassigned += 1;
      }
    });

    return {
      total: timelineEntries.length,
      overdue,
      next24h: upcoming24h,
      unassigned,
    };
  }, [timelineEntries, nowTick]);

  const timelineFilterOptions = React.useMemo(
    () => [
      {
        value: 'all' as const,
        label: 'Todos',
        description: 'Mostrar todos os marcos programados.',
        count: timelineCounts.total,
      },
      {
        value: 'overdue' as const,
        label: 'Atrasados',
        description: 'Focar marcos que já passaram da hora agendada.',
        count: timelineCounts.overdue,
      },
      {
        value: 'next24h' as const,
        label: 'Próx. 24h',
        description: 'Priorizar marcos previstos para o próximo dia.',
        count: timelineCounts.next24h,
      },
      {
        value: 'unassigned' as const,
        label: 'Sem responsável',
        description: 'Destacar marcos que ainda não têm responsável.',
        count: timelineCounts.unassigned,
      },
    ],
    [timelineCounts],
  );

  const filteredTimeline = React.useMemo(() => {
    if (timelineFilter === 'all') {
      return timelineEntries;
    }

    const now = nowTick;
    const next24h = now + 24 * 60 * 60_000;

    return timelineEntries.filter((entry) => {
      if (timelineFilter === 'overdue') {
        return entry.timestamp !== null && entry.timestamp < now;
      }

      if (timelineFilter === 'next24h') {
        return entry.timestamp !== null && entry.timestamp >= now && entry.timestamp <= next24h;
      }

      if (timelineFilter === 'unassigned') {
        return entry.ownerMissing;
      }

      return true;
    });
  }, [timelineEntries, timelineFilter, nowTick]);

  const filteredTimelineCount = filteredTimeline.length;

  const handleStatusShortcut = React.useCallback(
    (nextStatus: StatusFilter) => {
      setStatus((current) => (current === nextStatus ? '' : nextStatus));
    },
    [],
  );

  const handleTimelineFilter = React.useCallback((scope: TimelineScope) => {
    setTimelineFilter((current) => {
      if (scope === 'all') {
        return 'all';
      }
      return current === scope ? 'all' : scope;
    });
  }, []);

  const resetFilters = React.useCallback(() => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setShift('');
  }, []);

  const handleRefresh = React.useCallback(() => {
    void fetchRoster({ silent: false });
  }, [fetchRoster]);

  const isRefreshing = refreshing && !loading;
  const staleThresholdMs = 5 * 60_000;
  const isStale = lastFetchedAt ? Date.now() - lastFetchedAt > staleThresholdMs : false;
  const syncMessage = React.useMemo(() => {
    if (loading) return 'A sincronizar escala…';
    if (isRefreshing) return 'A actualizar dados…';
    return describeLastSync(lastFetchedAt);
  }, [loading, isRefreshing, lastFetchedAt]);

  const timelineEmptyMessage = React.useMemo(() => {
    if (timelineFilter === 'all') {
      return 'Sem marcos agendados para as atribuições filtradas.';
    }

    const activeScope = timelineFilterOptions.find((option) => option.value === timelineFilter);
    if (activeScope?.value === 'overdue') {
      return 'Sem marcos atrasados neste momento — excelente sinal!';
    }
    if (activeScope?.value === 'next24h') {
      return 'Nenhum marco previsto para as próximas 24 horas.';
    }
    if (activeScope?.value === 'unassigned') {
      return 'Todos os marcos têm responsável atribuído.';
    }

    return 'Nenhum marco corresponde ao filtro seleccionado.';
  }, [timelineFilter, timelineFilterOptions]);

  const timelineTotalLabel = React.useMemo(() => {
    if (timelineCounts.total === 0) {
      return 'Sem marcos para monitorizar';
    }

    const totalSuffix = timelineCounts.total === 1 ? 'marco monitorizado' : 'marcos monitorizados';

    if (timelineFilter === 'all') {
      return `${timelineCounts.total} ${totalSuffix}`;
    }

    const filteredSuffix = filteredTimelineCount === 1 ? 'marco' : 'marcos';

    return `${filteredTimelineCount} ${filteredSuffix} no filtro actual de ${timelineCounts.total} ${totalSuffix}`;
  }, [timelineCounts.total, filteredTimelineCount, timelineFilter]);

  const badgeState = React.useMemo<'loading' | 'idle' | 'fresh' | 'stale' | 'warning' | 'danger'>(() => {
    if (loading || isRefreshing) return 'loading';
    if (!lastFetchedAt) return 'idle';
    if (banner?.tone === 'danger') return 'danger';
    if (banner?.tone === 'warning') return 'warning';
    return isStale ? 'stale' : 'fresh';
  }, [loading, isRefreshing, lastFetchedAt, banner, isStale]);

  return (
    <div className="admin-page neo-stack neo-stack--xl">
      <PageHeader
        title="Escala & atribuições"
        subtitle="Orquestra a distribuição de clientes por treinador com um overview responsivo e orientado ao futuro."
        actions={(
          <div className="neo-quick-actions">
            <button type="button" className="btn" data-variant="primary">
              <span className="btn__icon">
                <UserPlus2 className="neo-icon neo-icon--sm" aria-hidden="true" />
              </span>
              <span className="btn__label">Nova atribuição</span>
            </button>
            <Link href="/dashboard/admin/approvals" className="btn" data-variant="ghost" prefetch={false}>
              <span className="btn__icon">
                <Sparkles className="neo-icon neo-icon--sm" aria-hidden="true" />
              </span>
              <span className="btn__label">Ver aprovações</span>
            </Link>
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
            >
              <span className="btn__icon">
                {loading || isRefreshing ? (
                  <span className="neo-spinner" aria-hidden="true" />
                ) : (
                  <RefreshCcw className="neo-icon neo-icon--sm" aria-hidden="true" />
                )}
              </span>
              <span className="btn__label">{loading || isRefreshing ? 'A sincronizar…' : 'Actualizar'}</span>
            </button>
          </div>
        )}
      />

      {banner && (
        <div className="neo-surface neo-surface--compact" data-variant={banner.tone} role="status" aria-live="polite">
          <p className="neo-text--sm text-fg">{banner.message}</p>
        </div>
      )}

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Indicadores principais">
        <header className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
          <div className="neo-stack neo-stack--xs">
            <h2 className="neo-panel__title">Indicadores principais</h2>
            <p className="neo-panel__subtitle">Resumo da distribuição actual de clientes por treinador.</p>
          </div>
          <div className="admin-roster__summary" role="status" aria-live="polite">
            <span className="admin-roster__countBadge">
              {count} {count === 1 ? 'registo' : 'registos'} activos
            </span>
            <span className="admin-roster__badge" data-state={badgeState}>
              {badgeState === 'loading' ? (
                <span className="neo-spinner" aria-hidden="true" />
              ) : (
                <span className="admin-roster__badgeDot" data-state={badgeState} aria-hidden="true" />
              )}
              <span className="admin-roster__badgeText">{syncMessage}</span>
            </span>
          </div>
        </header>

        <div className="admin-roster__metrics">
          <article className="admin-roster__metric" data-tone="primary">
            <span className="admin-roster__metricLabel">Treinadores listados</span>
            <span className="admin-roster__metricValue">{metrics.trainers}</span>
          </article>
          <article className="admin-roster__metric" data-tone="info">
            <span className="admin-roster__metricLabel">Clientes sob gestão</span>
            <span className="admin-roster__metricValue">{metrics.clients}</span>
          </article>
          <button
            type="button"
            className="admin-roster__metric admin-roster__metric--shortcut"
            data-tone="success"
            data-active={status === 'active'}
            onClick={() => handleStatusShortcut('active')}
            aria-pressed={status === 'active'}
          >
            <span className="admin-roster__metricLabel">Escalas activas</span>
            <span className="admin-roster__metricValue">{metrics.active}</span>
          </button>
          <button
            type="button"
            className="admin-roster__metric admin-roster__metric--shortcut"
            data-tone="warning"
            data-active={status === 'onboarding'}
            onClick={() => handleStatusShortcut('onboarding')}
            aria-pressed={status === 'onboarding'}
          >
            <span className="admin-roster__metricLabel">Onboarding</span>
            <span className="admin-roster__metricValue">{metrics.onboarding}</span>
          </button>
          <button
            type="button"
            className="admin-roster__metric admin-roster__metric--shortcut"
            data-tone="neutral"
            data-active={status === 'paused'}
            onClick={() => handleStatusShortcut('paused')}
            aria-pressed={status === 'paused'}
          >
            <span className="admin-roster__metricLabel">Em pausa</span>
            <span className="admin-roster__metricValue">{metrics.paused}</span>
          </button>
        </div>

        <div className="admin-roster__filters" role="group" aria-label="Filtros da escala">
          <label htmlFor="roster-search" className="admin-roster__field">
            <span className="admin-roster__label">Pesquisar</span>
            <input
              id="roster-search"
              type="search"
              className="neo-field"
              placeholder="Treinador, cliente, tag…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  const trimmedValue = event.currentTarget.value.trim();
                  setSearch(trimmedValue);
                  setSearchInput(event.currentTarget.value);
                }
              }}
              autoComplete="off"
            />
          </label>

          <label htmlFor="roster-status" className="admin-roster__field">
            <span className="admin-roster__label">Estado</span>
            <select
              id="roster-status"
              className="neo-field"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
            >
              {statusOptions.map((option) => (
                <option key={option.value || 'all-status'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="roster-shift" className="admin-roster__field">
            <span className="admin-roster__label">Turno</span>
            <select
              id="roster-shift"
              className="neo-field"
              value={shift}
              onChange={(event) => setShift(event.target.value as ShiftFilter)}
            >
              {shiftOptions.map((option) => (
                <option key={option.value || 'all-shifts'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-roster__field admin-roster__field--shortcut">
            <span className="admin-roster__label">Atalhos</span>
            <div className="neo-inline neo-inline--sm">
              <Link href="/dashboard/admin/pts-schedule" className="btn" data-variant="ghost" prefetch={false}>
                <span className="btn__icon">
                  <CalendarClock className="neo-icon neo-icon--sm" aria-hidden="true" />
                </span>
                <span className="btn__label">Agenda de PTs</span>
              </Link>
              <button type="button" className="btn" data-variant="ghost" data-size="sm" onClick={resetFilters}>
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Tabela de atribuições">
        <header className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
          <div className="neo-stack neo-stack--xs">
            <h2 className="neo-panel__title">Distribuição actual</h2>
            <p className="neo-panel__subtitle">Vista consolidada por treinador com próximos marcos de acompanhamento.</p>
          </div>
        </header>

        <div className="neo-table-wrapper" role="region" aria-live="polite" aria-busy={loading} data-loading={loading}>
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Treinador</th>
                <th scope="col">Clientes</th>
                <th scope="col">Estado</th>
                <th scope="col">Próximo check-in</th>
                <th scope="col">Tags</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Acções
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && assignments.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-table-empty">
                      <div className="neo-inline neo-inline--center neo-inline--sm neo-text--sm neo-text--muted">
                        <span className="neo-spinner" aria-hidden /> A sincronizar escala…
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && assignments.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-table-empty">
                      Nenhuma atribuição corresponde aos filtros actuais. Ajusta o estado ou limpa a pesquisa para veres mais
                      resultados.
                    </div>
                  </td>
                </tr>
              )}

              {assignments.map((assignment) => {
                const trainerName = assignment.trainer_name ?? assignment.trainer_id;
                const focus = assignment.trainer_focus ?? '—';
                const tags = assignment.tags ?? [];
                const load = assignment.load_level ?? '—';
                const tone = toneForStatus(assignment.status);
                const highlightedClientName = assignment.highlighted_client_name ?? assignment.highlighted_client_id;
                const highlightedClientLink = assignment.highlighted_client_id
                  ? `/dashboard/users/${assignment.highlighted_client_id}`
                  : null;

                let statusLabel = assignment.status ?? '—';
                if (tone === 'success') statusLabel = 'Operacional';
                if (tone === 'warning') statusLabel = 'Onboarding';
                if (tone === 'neutral') statusLabel = 'Em pausa';

                return (
                  <tr key={assignment.id}>
                    <td data-title="Treinador">
                      <div className="neo-stack neo-stack--xs">
                        <span className="neo-text--sm neo-text--semibold text-fg">{trainerName || '—'}</span>
                        <span className="neo-text--xs neo-text--muted">{focus}</span>
                      </div>
                    </td>
                    <td data-title="Clientes">
                      <div className="neo-inline neo-inline--sm neo-text--sm neo-text--semibold text-fg">
                        <Users2 className="neo-icon neo-icon--sm neo-text--muted" aria-hidden />
                        {assignment.clients_count ?? 0}
                      </div>
                      {highlightedClientName && (
                        highlightedClientLink ? (
                          <Link
                            href={highlightedClientLink}
                            className="neo-text--xs neo-text--muted admin-roster__highlight"
                            prefetch={false}
                          >
                            Destaque · {highlightedClientName}
                          </Link>
                        ) : (
                          <span className="neo-text--xs neo-text--muted admin-roster__highlight">
                            Destaque · {highlightedClientName}
                          </span>
                        )
                      )}
                    </td>
                    <td data-title="Estado">
                      <span className="neo-table__status" data-state={tone}>
                        {statusLabel}
                      </span>
                    </td>
                    <td data-title="Próximo check-in">
                      <div className="neo-stack neo-stack--xs">
                        <span className="neo-text--sm text-fg">{formatCheckIn(assignment.next_check_in_at)}</span>
                        <span className="neo-text--xs neo-text--muted">Última sync {formatRelative(assignment.last_synced_at)}</span>
                      </div>
                    </td>
                    <td data-title="Tags">
                      <div className="neo-inline neo-inline--wrap neo-inline--sm">
                        {tags.length > 0 ? (
                          tags.map((tag) => (
                            <span key={tag} className="neo-tag" data-tone="neutral">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="neo-text--xs neo-text--muted">Sem tags</span>
                        )}
                      </div>
                      <span className="neo-text--xs neo-text--muted admin-roster__loadHint">Carga · {load}</span>
                    </td>
                    <td data-title="Acções" style={{ textAlign: 'right' }}>
                      <div className="neo-inline neo-inline--end neo-inline--sm">
                        <Link
                          href={`/dashboard/admin/pts-schedule?trainer=${encodeURIComponent(trainerName ?? '')}`}
                          className="btn"
                          data-variant="ghost"
                          data-size="sm"
                          prefetch={false}
                        >
                          Ver agenda
                        </Link>
                        <button type="button" className="btn" data-variant="ghost" data-size="sm">
                          Detalhes
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

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Próximos marcos">
        <header className="neo-stack neo-stack--xs">
          <h2 className="neo-panel__title">Marcos iminentes</h2>
          <p className="neo-panel__subtitle">Agenda condensada para garantir acompanhamento em tempo quase-real.</p>
        </header>

        <div className="admin-roster__timelineToolbar" aria-live="polite">
          <div className="admin-roster__timelineFilters" role="group" aria-label="Filtrar marcos da timeline">
            {timelineFilterOptions.map((option) => {
              const isActive = timelineFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className="admin-roster__timelineFilter"
                  data-active={isActive}
                  onClick={() => handleTimelineFilter(option.value)}
                  aria-pressed={isActive}
                  aria-label={`${option.label} — ${option.description}`}
                  title={`${option.label} · ${option.description}`}
                >
                  <span className="admin-roster__timelineFilterLabel">{option.label}</span>
                  <span className="admin-roster__timelineFilterCount">{option.count}</span>
                </button>
              );
            })}
          </div>
          <span className="admin-roster__timelineTotal" role="status">{timelineTotalLabel}</span>
        </div>

        <ol className="admin-roster__timeline neo-stack neo-stack--md" aria-live="polite" aria-busy={loading}>
          {loading && timelineEntries.length === 0 && (
            <li className="neo-panel neo-panel--compact admin-roster__empty admin-roster__timelineLoader">
              <div className="neo-inline neo-inline--center neo-inline--sm neo-text--sm neo-text--muted">
                <span className="neo-spinner" aria-hidden /> A sincronizar marcos…
              </div>
            </li>
          )}

          {!loading && filteredTimeline.length === 0 && (
            <li className="neo-panel neo-panel--compact admin-roster__empty">{timelineEmptyMessage}</li>
          )}

          {filteredTimeline.map(({ item, tone, urgency, assignmentLabel, ownerLabel, ownerMissing, when }) => (
            <li key={item.id} className="admin-roster__timelineItem" data-tone={tone}>
              <div className="admin-roster__timelineContent">
                <div className="neo-stack neo-stack--xs">
                  <span className="admin-roster__timelineTitle">{item.title ?? 'Marcar acompanhamento'}</span>
                  <span className="admin-roster__timelineDetail">{item.detail ?? 'Detalhes em actualização.'}</span>
                </div>
                <div className="admin-roster__timelineMeta">
                  <span className="admin-roster__timelineWhen">{when}</span>
                  {urgency && (
                    <span className="admin-roster__timelineUrgency" data-tone={tone}>
                      {urgency}
                    </span>
                  )}
                  {assignmentLabel && <span className="admin-roster__timelineAssignment">{assignmentLabel}</span>}
                  <span className="admin-roster__timelineOwner" data-missing={ownerMissing}>
                    {ownerLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
