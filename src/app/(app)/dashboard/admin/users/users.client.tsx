'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import {
  ArrowUpRight,
  Copy,
  Download,
  Filter,
  Globe,
  Loader2,
  RefreshCcw,
  Search,
  TrendingUp,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import clsx from 'clsx';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type {
  AdminUsersDashboardData,
  AdminUsersDistribution,
  AdminUsersTimelinePoint,
} from '@/lib/users/types';
import { toAppRole } from '@/lib/roles';

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const percentageFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});
const shortDateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('pt-PT', {
  hour: '2-digit',
  minute: '2-digit',
});

const ROLE_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todos os perfis' },
  { value: 'ADMIN', label: 'Administradores' },
  { value: 'PT', label: 'Personal Trainers' },
  { value: 'CLIENT', label: 'Clientes' },
];

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todos os estados' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'INVITED', label: 'Convite enviado' },
  { value: 'SUSPENDED', label: 'Suspensos' },
  { value: 'DISABLED', label: 'Desativados' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

type StatusKey = 'ACTIVE' | 'PENDING' | 'INVITED' | 'SUSPENDED' | 'DISABLED' | 'UNKNOWN';
type StatusTone = 'positive' | 'warning' | 'critical' | 'info' | 'neutral';

type Row = {
  id: string;
  name: string;
  email: string | null;
  roleKey: 'ADMIN' | 'PT' | 'CLIENT';
  roleLabel: string;
  statusKey: StatusKey;
  statusLabel: string;
  statusTone: StatusTone;
  approved: boolean;
  active: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
  online: boolean;
};

type ListResponse = {
  rows: any[];
  count?: number;
  _supabaseConfigured?: boolean;
};

type DashboardResponse = AdminUsersDashboardData & { ok: true; source: 'supabase' | 'fallback' };

type Feedback = { tone: 'info' | 'success' | 'warning' | 'danger'; message: string } | null;

type ParamsState = {
  page: number;
  pageSize: number;
  role: string;
  status: string;
  search: string;
};

const STATUS_META: Record<StatusKey, { label: string; tone: StatusTone }> = {
  ACTIVE: { label: 'Ativo', tone: 'positive' },
  PENDING: { label: 'Pendente', tone: 'warning' },
  INVITED: { label: 'Convite enviado', tone: 'info' },
  SUSPENDED: { label: 'Suspenso', tone: 'critical' },
  DISABLED: { label: 'Desativado', tone: 'critical' },
  UNKNOWN: { label: 'Indefinido', tone: 'neutral' },
};

const ROLE_META: Record<Row['roleKey'], { label: string; tone: StatusTone }> = {
  ADMIN: { label: 'Administrador', tone: 'critical' },
  PT: { label: 'Personal Trainer', tone: 'info' },
  CLIENT: { label: 'Cliente', tone: 'positive' },
};

function clamp01(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  if (!Number.isFinite(value)) return 1;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function formatPercentage(value: number | null | undefined) {
  const safe = clamp01(value);
  return percentageFormatter.format(safe);
}

function normaliseStatus(
  status: string | null | undefined,
  approved: boolean | null | undefined,
  active: boolean | null | undefined,
): StatusKey {
  const value = status?.toString().trim().toUpperCase();
  if (value === 'ACTIVE' || value === 'CONFIRMED') return 'ACTIVE';
  if (value === 'PENDING' || value === 'WAITING' || value === 'REVIEW') return 'PENDING';
  if (value === 'INVITED' || value === 'INVITE' || value === 'ONBOARDING') return 'INVITED';
  if (value === 'SUSPENDED' || value === 'BLOCKED') return 'SUSPENDED';
  if (value === 'DISABLED' || value === 'DEACTIVATED' || active === false) return 'DISABLED';
  if (approved === false) return 'PENDING';
  return 'UNKNOWN';
}

function formatRelative(iso: string | null) {
  if (!iso) return '—';
  try {
    const value = new Date(iso).getTime();
    if (Number.isNaN(value)) return '—';
    const diff = Date.now() - value;
    const minutes = Math.round(diff / 60000);
    if (minutes < 1) return 'agora';
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

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${shortDateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

function readParams(searchParams: ReturnType<typeof useSearchParams>, fallbackPageSize: number): ParamsState {
  const page = Number.parseInt(searchParams.get('page') ?? '0', 10);
  const pageSize = Number.parseInt(
    searchParams.get('pageSize') ?? searchParams.get('perPage') ?? String(fallbackPageSize),
    10,
  );
  const role = searchParams.get('role') ?? 'all';
  const status = searchParams.get('status') ?? 'all';
  const search = searchParams.get('q') ?? '';

  return {
    page: Number.isFinite(page) && page >= 0 ? page : 0,
    pageSize: PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : fallbackPageSize,
    role,
    status,
    search,
  };
}

async function fetcher(url: string): Promise<ListResponse> {
  const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível carregar os utilizadores.');
  }
  return response.json();
}

async function dashboardFetcher(url: string): Promise<DashboardResponse> {
  const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível carregar as métricas.');
  }
  const json = await response.json();
  if (!json || typeof json !== 'object' || json.ok !== true) {
    throw new Error('Resposta inválida do servidor.');
  }
  return json as DashboardResponse;
}

function mapRow(row: any): Row {
  const role = toAppRole(row.role ?? row.profile ?? null) ?? 'CLIENT';
  const roleKey: Row['roleKey'] = role === 'ADMIN' ? 'ADMIN' : role === 'PT' ? 'PT' : 'CLIENT';
  const roleMeta = ROLE_META[roleKey];
  const statusKey = normaliseStatus(row.status ?? row.state ?? null, row.approved, row.active);
  const statusMeta = STATUS_META[statusKey];

  return {
    id: String(row.id ?? crypto.randomUUID()),
    name: row.name?.trim() || row.full_name?.trim() || row.email?.trim() || 'Utilizador',
    email: row.email ?? null,
    roleKey,
    roleLabel: roleMeta.label,
    statusKey,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    approved: Boolean(row.approved ?? row.is_approved ?? (statusKey === 'ACTIVE')), 
    active: row.active === undefined ? statusKey === 'ACTIVE' : Boolean(row.active),
    createdAt: row.created_at ?? row.createdAt ?? null,
    lastLoginAt: row.last_login_at ?? row.lastLoginAt ?? row.last_sign_in_at ?? null,
    lastSeenAt: row.last_seen_at ?? row.lastSeenAt ?? null,
    online: Boolean(row.online ?? row.is_online ?? false),
  };
}

function buildListKey({ page, pageSize, role, status, search }: ParamsState) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (role && role !== 'all') params.set('role', role);
  if (status && status !== 'all') params.set('status', status);
  if (search && search.trim()) params.set('q', search.trim());
  return `/api/admin/users?${params.toString()}`;
}

function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span className="admin-users__status" data-tone={tone}>
      <span className="admin-users__statusDot" aria-hidden />
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: Row['roleKey'] }) {
  const meta = ROLE_META[role];
  return (
    <span className="admin-users__role" data-tone={meta.tone}>
      {meta.label}
    </span>
  );
}

function OnlineBadge({ online }: { online: boolean }) {
  return (
    <span className="admin-users__online" data-state={online ? 'online' : 'offline'}>
      <span className="admin-users__onlineDot" aria-hidden />
      {online ? 'Online' : 'Offline'}
    </span>
  );
}

function TimelineChart({ data, loading }: { data: AdminUsersTimelinePoint[]; loading?: boolean }) {
  const timelineData = Array.isArray(data) ? data : [];

  const { hasPositiveValues, safeMaxValue } = React.useMemo(() => {
    const maxValue = timelineData.reduce((acc, point) => {
      const signups = typeof point.signups === 'number' ? point.signups : 0;
      const active = typeof point.active === 'number' ? point.active : 0;
      return Math.max(acc, signups, active);
    }, 0);

    return {
      hasPositiveValues: maxValue > 0,
      safeMaxValue: maxValue > 0 ? maxValue : 1,
    };
  }, [timelineData]);

  const computeHeight = React.useCallback(
    (rawValue: number | null | undefined) => {
      if (!hasPositiveValues) return 0;

      const value = typeof rawValue === 'number' ? rawValue : 0;
      if (value <= 0) return 0;

      const ratio = (value / safeMaxValue) * 100;
      const bounded = Math.min(Math.max(ratio, 0), 100);
      if (bounded === 0) return 0;
      return Math.max(bounded, 6);
    },
    [hasPositiveValues, safeMaxValue],
  );

  if (loading) {
    return (
      <div className="admin-users__chartSkeleton" aria-hidden>
        <div className="admin-users__chartBar" />
        <div className="admin-users__chartBar" />
        <div className="admin-users__chartBar" />
      </div>
    );
  }

  if (!timelineData.length) {
    return (
      <div className="neo-empty">
        <span className="neo-empty__icon" aria-hidden>
          📉
        </span>
        <p className="neo-empty__title">Sem dados de registo</p>
        <p className="neo-empty__description">Ainda não existem registos suficientes para gerar a linha temporal.</p>
      </div>
    );
  }

  return (
    <div className="admin-users__chart" role="img" aria-label="Inscrições e atividade semanal">
      {timelineData.map((point) => {
        const signups = typeof point.signups === 'number' ? point.signups : 0;
        const active = typeof point.active === 'number' ? point.active : 0;

        return (
          <div
            key={point.week}
            className="admin-users__chartWeek"
            title={`Semana ${point.label}: ${signups} inscrições, ${active} ativos`}
          >
            <div
              className="admin-users__chartWeekBar"
              data-type="signups"
              style={{ height: `${computeHeight(signups)}%` }}
            >
              <span className="sr-only">{signups} inscrições</span>
            </div>
            <div
              className="admin-users__chartWeekBar"
              data-type="active"
              style={{ height: `${computeHeight(active)}%` }}
            >
              <span className="sr-only">{active} ativos</span>
            </div>
            <div className="admin-users__chartWeekLabel">{point.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function DistributionList({ title, icon, items }: { title: string; icon: React.ReactNode; items: AdminUsersDistribution[] }) {
  return (
    <section className="neo-panel admin-users__distribution">
      <header className="neo-panel__header">
        <div>
          <h2 className="neo-panel__title">{title}</h2>
          <p className="neo-panel__subtitle">Distribuição atualizada em tempo real</p>
        </div>
        <span className="neo-panel__icon" aria-hidden>
          {icon}
        </span>
      </header>
      <div className="neo-panel__body">
        {!items.length ? (
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              📊
            </span>
            <p className="neo-empty__title">Sem registos</p>
            <p className="neo-empty__description">Ainda não há dados suficientes para esta métrica.</p>
          </div>
        ) : (
          <ul className="admin-users__distributionList" role="list">
            {items.map((item) => {
              const percentage = clamp01(item.percentage);
              const width = percentage === 0 ? 0 : Math.min(Math.max(percentage * 100, 6), 100);
              return (
                <li key={item.key} className="admin-users__distributionItem">
                  <div>
                    <p className="admin-users__distributionLabel">{item.label}</p>
                    <p className="admin-users__distributionMeta">
                      {numberFormatter.format(item.total)} · {formatPercentage(percentage)}
                    </p>
                  </div>
                  <div className="admin-users__distributionBar" aria-hidden>
                    <span style={{ width: `${width}%` }} data-tone={item.tone ?? 'neutral'} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function UsersClient({ pageSize = 20 }: { pageSize?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsText = React.useMemo(() => searchParams.toString(), [searchParams]);

  const initial = React.useMemo(() => readParams(searchParams, pageSize), [searchParams, pageSize]);

  const [page, setPage] = React.useState(initial.page);
  const [pageSizeState, setPageSizeState] = React.useState(initial.pageSize);
  const [role, setRole] = React.useState(initial.role);
  const [status, setStatus] = React.useState(initial.status);
  const [searchInput, setSearchInput] = React.useState(initial.search);
  const [debouncedSearch, setDebouncedSearch] = React.useState(initial.search);
  const [feedback, setFeedback] = React.useState<Feedback>(null);
  const filtersSnapshotRef = React.useRef<Pick<ParamsState, 'search' | 'role' | 'status' | 'pageSize'>>({
    search: initial.search,
    role: initial.role,
    status: initial.status,
    pageSize: initial.pageSize,
  });

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev === searchInput) return prev;
        return searchInput;
      });
    }, 280);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  React.useEffect(() => {
    setPage((prev) => {
      if (prev === initial.page) return prev;
      return initial.page;
    });
    setPageSizeState((prev) => {
      if (prev === initial.pageSize) return prev;
      return initial.pageSize;
    });
    setRole((prev) => (prev === initial.role ? prev : initial.role));
    setStatus((prev) => (prev === initial.status ? prev : initial.status));
    setSearchInput((prev) => (prev === initial.search ? prev : initial.search));
    setDebouncedSearch((prev) => (prev === initial.search ? prev : initial.search));
    filtersSnapshotRef.current = {
      search: initial.search,
      role: initial.role,
      status: initial.status,
      pageSize: initial.pageSize,
    };
  }, [initial.page, initial.pageSize, initial.role, initial.status, initial.search]);

  React.useEffect(() => {
    const snapshot = filtersSnapshotRef.current;
    if (
      snapshot.search === debouncedSearch &&
      snapshot.role === role &&
      snapshot.status === status &&
      snapshot.pageSize === pageSizeState
    ) {
      return;
    }

    filtersSnapshotRef.current = {
      search: debouncedSearch,
      role,
      status,
      pageSize: pageSizeState,
    };

    setPage((prev) => (prev === 0 ? prev : 0));
  }, [debouncedSearch, role, status, pageSizeState]);

  const queryState = React.useMemo<ParamsState>(
    () => ({ page, pageSize: pageSizeState, role, status, search: debouncedSearch }),
    [page, pageSizeState, role, status, debouncedSearch],
  );

  const listKey = React.useMemo(() => buildListKey(queryState), [queryState]);
  const { data: listData, error: listError, isLoading: listLoading, mutate: mutateList } = useSWR(listKey, fetcher, {
    keepPreviousData: true,
  });

  const {
    data: dashboard,
    error: dashboardError,
    isLoading: dashboardLoading,
    mutate: mutateDashboard,
  } = useSWR<DashboardResponse>('/api/admin/users/dashboard', dashboardFetcher, { keepPreviousData: true });

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (queryState.page > 0) params.set('page', String(queryState.page));
    if (queryState.pageSize !== pageSize) params.set('pageSize', String(queryState.pageSize));
    if (queryState.role !== 'all') params.set('role', queryState.role);
    if (queryState.status !== 'all') params.set('status', queryState.status);
    if (queryState.search.trim()) params.set('q', queryState.search.trim());

    const nextQuery = params.toString();
    const currentParams = new URLSearchParams(searchParamsText);
    const currentPage = Number.parseInt(currentParams.get('page') ?? '0', 10);
    if (!Number.isFinite(currentPage) || currentPage <= 0) {
      currentParams.delete('page');
    }

    const legacyPerPage = currentParams.get('perPage');
    const currentPageSizeRaw = currentParams.get('pageSize') ?? legacyPerPage ?? String(pageSize);
    if (legacyPerPage) {
      currentParams.delete('perPage');
    }
    const currentPageSize = Number.parseInt(currentPageSizeRaw, 10);
    if (!Number.isFinite(currentPageSize) || currentPageSize === pageSize) {
      currentParams.delete('pageSize');
    } else {
      currentParams.set('pageSize', String(currentPageSize));
    }

    const currentRole = currentParams.get('role');
    if (!currentRole || currentRole === 'all') {
      currentParams.delete('role');
    }

    const currentStatus = currentParams.get('status');
    if (!currentStatus || currentStatus === 'all') {
      currentParams.delete('status');
    }

    const currentSearch = currentParams.get('q');
    if (!currentSearch || !currentSearch.trim()) {
      currentParams.delete('q');
    } else {
      currentParams.set('q', currentSearch.trim());
    }

    const currentQuery = currentParams.toString();
    const hasLegacyPerPage = searchParamsText.includes('perPage=');
    if (!hasLegacyPerPage && currentQuery === nextQuery) {
      return;
    }

    const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(href, { scroll: false });
  }, [pathname, router, queryState, pageSize, searchParamsText]);

  const rows = React.useMemo(() => (listData?.rows ?? []).map(mapRow), [listData]);
  const totalRows = listData?.count ?? rows.length;
  const maxPageIndex = Math.max(0, Math.ceil(Math.max(totalRows, 1) / queryState.pageSize) - 1);

  React.useEffect(() => {
    if (page > maxPageIndex) {
      setPage(maxPageIndex);
    }
  }, [page, maxPageIndex]);

  React.useEffect(() => {
    if (!feedback) return;
    const handle = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(handle);
  }, [feedback]);

  const handlePageChange = (direction: 'prev' | 'next') => {
    setPage((prev) => {
      if (direction === 'prev') return Math.max(prev - 1, 0);
      return Math.min(prev + 1, maxPageIndex);
    });
  };

  const handleExport = () => {
    if (!rows.length) {
      setFeedback({ tone: 'info', message: 'Sem registos para exportar.' });
      return;
    }
    const header = [
      'id',
      'nome',
      'email',
      'perfil',
      'estado',
      'aprovado',
      'ativo',
      'criado_em',
      'ultimo_login',
      'ultima_sessao',
      'online',
    ];
    const lines = rows.map((row) => [
      row.id,
      row.name,
      row.email ?? '',
      row.roleLabel,
      row.statusLabel,
      row.approved ? 'true' : 'false',
      row.active ? 'true' : 'false',
      row.createdAt ?? '',
      row.lastLoginAt ?? '',
      row.lastSeenAt ?? '',
      row.online ? 'true' : 'false',
    ]);

    const csv = [header, ...lines]
      .map((record) =>
        record
          .map((value) => {
            const cell = String(value ?? '');
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilizadores-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setFeedback({ tone: 'success', message: 'Exportação iniciada.' });
  };

  const handleCopyEmails = async () => {
    const emails = rows.map((row) => row.email).filter((value): value is string => Boolean(value));
    if (!emails.length) {
      setFeedback({ tone: 'info', message: 'Não há emails disponíveis nesta página.' });
      return;
    }
    const payload = emails.join(', ');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = payload;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setFeedback({ tone: 'success', message: 'Emails copiados para a área de transferência.' });
    } catch (error) {
      console.error('[admin-users] clipboard failed', error);
      setFeedback({ tone: 'danger', message: 'Não foi possível copiar os emails.' });
    }
  };

  const handleRefresh = () => {
    void mutateList();
    void mutateDashboard();
    setFeedback({ tone: 'info', message: 'Atualização em curso…' });
  };

  const loading = listLoading && !listData;

  return (
    <div className="admin-users">
      <PageHeader
        title="Utilizadores"
        subtitle="Monitoriza o estado da tua comunidade, acompanha aprovações e atua em tempo real."
        actions={(
          <div className="admin-users__headerActions">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              leftIcon={<RefreshCcw className="neo-icon neo-icon--sm" aria-hidden />}
            >
              Atualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyEmails}
              leftIcon={<Copy className="neo-icon neo-icon--sm" aria-hidden />}
            >
              Copiar emails
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="neo-icon neo-icon--sm" aria-hidden />}
            >
              Exportar CSV
            </Button>
            <Link
              href="/dashboard/admin/users/new"
              className="btn"
              data-variant="primary"
              data-size="sm"
            >
              <span className="btn__icon btn__icon--left">
                <UserPlus className="neo-icon neo-icon--sm" aria-hidden />
              </span>
              <span className="btn__label">Novo utilizador</span>
            </Link>
          </div>
        )}
      />

      <div className="admin-users__layout">
        <section className="neo-panel admin-users__metrics">
          <header className="neo-panel__header">
            <div>
              <h2 className="neo-panel__title">Resumo rápido</h2>
              <p className="neo-panel__subtitle">
                Indicadores com base em {dashboard?.rows.length ?? 0} registos recentes.
              </p>
            </div>
            <span className="neo-panel__icon" aria-hidden>
              <Users className="neo-icon" />
            </span>
          </header>
          <div className="neo-panel__body">
            {dashboardLoading && !dashboard ? (
              <div className="admin-users__hero" aria-hidden>
                <div className="admin-users__heroCard admin-users__heroCard--loading" />
                <div className="admin-users__heroCard admin-users__heroCard--loading" />
                <div className="admin-users__heroCard admin-users__heroCard--loading" />
              </div>
            ) : (
              <div className="admin-users__hero" role="list">
                {(dashboard?.hero ?? []).map((metric) => (
                  <article key={metric.key} className="admin-users__heroCard" data-tone={metric.tone ?? 'neutral'}>
                    <p className="admin-users__heroLabel">{metric.label}</p>
                    <p className="admin-users__heroValue">{metric.value}</p>
                    {metric.hint && <span className="admin-users__heroHint">{metric.hint}</span>}
                    {metric.trend && (
                      <span className="admin-users__heroTrend">
                        <TrendingUp className="neo-icon neo-icon--xs" aria-hidden /> {metric.trend}
                      </span>
                    )}
                  </article>
                ))}
                {!dashboard?.hero?.length && (
                  <div className="neo-empty" role="status">
                    <span className="neo-empty__icon" aria-hidden>
                      📈
                    </span>
                    <p className="neo-empty__title">Sem métricas</p>
                    <p className="neo-empty__description">Ainda não existem indicadores calculados.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="neo-panel admin-users__chartPanel">
          <header className="neo-panel__header">
            <div>
              <h2 className="neo-panel__title">Atividade semanal</h2>
              <p className="neo-panel__subtitle">Novas inscrições e utilizadores ativos por semana.</p>
            </div>
            <span className="neo-panel__icon" aria-hidden>
              <Globe className="neo-icon" />
            </span>
          </header>
          <div className="neo-panel__body">
            <TimelineChart data={dashboard?.timeline ?? []} loading={dashboardLoading && !dashboard} />
          </div>
        </section>

        <DistributionList
          title="Perfis"
          icon={<UserCog className="neo-icon" aria-hidden />}
          items={dashboard?.roles ?? []}
        />
        <DistributionList
          title="Estados"
          icon={<UserCheck className="neo-icon" aria-hidden />}
          items={dashboard?.statuses ?? []}
        />
      </div>

      <section className="neo-panel admin-users__tablePanel" aria-labelledby="admin-users-table">
        <header className="neo-panel__header admin-users__tableHeader">
          <div>
            <h2 id="admin-users-table" className="neo-panel__title">
              Lista de utilizadores
            </h2>
            <p className="neo-panel__subtitle">
              {listLoading ? 'A carregar registos…' : `${numberFormatter.format(totalRows)} registo(s) encontrados.`}
            </p>
          </div>
        </header>

        <div className="neo-panel__body">
          <div className="admin-users__toolbar">
            <label className="neo-input-group__field admin-users__search">
              <span className="neo-input-group__label">Pesquisar</span>
              <div className="admin-users__searchField">
                <Search className="neo-icon neo-icon--sm" aria-hidden />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  type="search"
                  placeholder="Nome, email ou ID…"
                  className="neo-input"
                  aria-label="Pesquisar utilizadores"
                />
              </div>
            </label>
            <div className="admin-users__filters" role="group" aria-label="Filtros">
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">
                  <Filter className="neo-icon neo-icon--xs" aria-hidden /> Perfil
                </span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="neo-input"
                  aria-label="Filtrar por perfil"
                >
                  {ROLE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">
                  <Filter className="neo-icon neo-icon--xs" aria-hidden /> Estado
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="neo-input"
                  aria-label="Filtrar por estado"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Linhas</span>
                <select
                  value={pageSizeState}
                  onChange={(event) => setPageSizeState(Number(event.target.value))}
                  className="neo-input"
                  aria-label="Linhas por página"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} / página
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className={clsx('neo-table-wrapper', { 'is-loading': loading })}>
            <table className="neo-table admin-users__table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contacto</th>
                  <th>Perfil</th>
                  <th>Estado</th>
                  <th>Último acesso</th>
                  <th>Última atividade</th>
                  <th>Online</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="admin-users__name">
                        <span className="admin-users__avatar" aria-hidden>
                          {row.name
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() ?? '')
                            .join('') || 'U'}
                        </span>
                        <div>
                          <p className="admin-users__nameText">{row.name}</p>
                          <p className="admin-users__meta">ID {row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-users__contact">
                        <span>{row.email ?? 'Sem email registado'}</span>
                        {row.email && (
                          <a className="admin-users__contactLink" href={`mailto:${row.email}`}>
                            Enviar email <ArrowUpRight className="neo-icon neo-icon--xs" aria-hidden />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={row.roleKey} />
                    </td>
                    <td>
                      <StatusBadge tone={row.statusTone} label={row.statusLabel} />
                    </td>
                    <td>
                      <div className="admin-users__timestamp">
                        <span>{formatDateTime(row.lastLoginAt)}</span>
                        <span className="admin-users__meta">{formatRelative(row.lastLoginAt)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-users__timestamp">
                        <span>{formatDateTime(row.lastSeenAt)}</span>
                        <span className="admin-users__meta">{formatRelative(row.lastSeenAt)}</span>
                      </div>
                    </td>
                    <td>
                      <OnlineBadge online={row.online} />
                    </td>
                    <td className="admin-users__actions">
                      <Link
                        href={`/dashboard/admin/users/${row.id}`}
                        className="btn"
                        data-variant="ghost"
                        data-size="sm"
                      >
                        <span className="btn__icon btn__icon--left">
                          <UserCog className="neo-icon neo-icon--xs" aria-hidden />
                        </span>
                        <span className="btn__label">Gerir</span>
                      </Link>
                    </td>
                  </tr>
                ))}

                {!rows.length && (
                  <tr>
                    <td colSpan={8}>
                      <div className="neo-empty">
                        <span className="neo-empty__icon" aria-hidden>
                          📭
                        </span>
                        <p className="neo-empty__title">Sem resultados</p>
                        <p className="neo-empty__description">
                          Ajusta a pesquisa ou limpa os filtros para ver mais utilizadores.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {loading && (
              <div className="admin-users__loading" role="status" aria-live="polite">
                <Loader2 className="neo-icon neo-spin" aria-hidden /> A carregar…
              </div>
            )}
          </div>
        </div>

        <footer className="neo-pagination" aria-label="Paginação">
          <div className="neo-pagination__summary">
            Página {page + 1} de {maxPageIndex + 1} · {numberFormatter.format(totalRows)} registos
          </div>
          <div className="neo-pagination__controls">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPage(0)}
              disabled={page === 0}
              aria-label="Primeira página"
            >
              «
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePageChange('prev')}
              disabled={page === 0}
              aria-label="Página anterior"
            >
              ‹
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePageChange('next')}
              disabled={page >= maxPageIndex}
              aria-label="Próxima página"
            >
              ›
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPage(maxPageIndex)}
              disabled={page >= maxPageIndex}
              aria-label="Última página"
            >
              »
            </Button>
          </div>
        </footer>
      </section>

      <div className="admin-users__alerts" aria-live="polite" aria-atomic="true">
        {feedback && <Alert tone={feedback.tone} title="Aviso">{feedback.message}</Alert>}
        {listData?._supabaseConfigured === false && (
          <Alert tone="warning" title="Dados de exemplo">
            Servidor não está configurado. A lista apresenta dados fictícios para ilustração.
          </Alert>
        )}
        {listError && (
          <Alert tone="danger" title="Erro a carregar utilizadores">
            {listError.message}
          </Alert>
        )}
        {dashboardError && (
          <Alert tone="warning" title="Falha ao carregar métricas">
            {dashboardError.message}
          </Alert>
        )}
      </div>
    </div>
  );
}

