'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Eraser,
  Printer,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import PageHeader from '@/components/ui/PageHeader';
import OpenInNewToggle from '@/components/ui/OpenInNewToggle';
import { useToast } from '@/components/ui/ToastProvider';
import { navigate } from '@/lib/nav';
import type {
  AdminApprovalBacklogRow,
  AdminApprovalsDashboardData,
  AdminApprovalHeroMetric,
  AdminApprovalHighlight,
  AdminApprovalReviewerStat,
  AdminApprovalSlaOverview,
  AdminApprovalStatusSegment,
  AdminApprovalTimelinePoint,
} from '@/lib/admin/approvals/types';

type Status = 'pending' | 'approved' | 'rejected' | string;

type StatusTone = 'warning' | 'success' | 'danger' | 'info';

type StatusMeta = { value: Status; label: string; tone: StatusTone };

const CANONICAL_STATUS_ORDER: Status[] = ['pending', 'approved', 'rejected'];

function canonicaliseStatusFilter(value?: string | null): Status | '' {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return statusLabel(trimmed).value;
}

type Row = {
  id: string;
  user_id: string;
  trainer_id?: string | null;
  name?: string | null;
  email?: string | null;
  requested_at?: string | null;
  status: Status;
  metadata?: Record<string, unknown> | null;
};

type ApprovalsApiResponse = {
  rows?: Array<{
    id: string | number;
    user_id?: string | number | null;
    uid?: string | number | null;
    user?: string | number | null;
    trainer_id?: string | number | null;
    coach_id?: string | number | null;
    name?: string | null;
    full_name?: string | null;
    profile_name?: string | null;
    email?: string | null;
    user_email?: string | null;
    requested_at?: string | null;
    created_at?: string | null;
    inserted_at?: string | null;
    updated_at?: string | null;
    approval_id?: string | number | null;
    member_id?: string | number | null;
    status?: string | null;
    state?: string | null;
    decision?: string | null;
    outcome?: string | null;
    metadata?: Record<string, unknown> | null;
  }>;
  count?: number;
  _supabaseConfigured?: boolean;
  error?: string;
  _searchFallback?: boolean;
  searchSampleSize?: number;
};

type Banner = { message: string; severity: 'info' | 'success' | 'warning' | 'error' };

const STATUS_FIELDS = ['status', 'state', 'decision', 'outcome'] as const;

const statusCopy: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pendente', tone: 'warning' },
  approved: { label: 'Aprovado', tone: 'success' },
  rejected: { label: 'Rejeitado', tone: 'danger' },
};

function normaliseStatus(value?: Status | null): Status {
  if (!value) return 'pending';
  const raw = String(value).toLowerCase();
  if (
    raw.includes('reject') ||
    raw.includes('deny') ||
    raw.includes('suspend') ||
    raw.includes('rejeit') ||
    raw.includes('recus') ||
    raw.includes('negad')
  ) {
    return 'rejected';
  }
  if (
    raw.includes('approve') ||
    raw === 'ok' ||
    raw === 'accepted' ||
    raw.includes('aprov') ||
    raw.includes('aceit') ||
    raw.includes('confirm')
  ) {
    return 'approved';
  }
  if (raw.includes('pend') || raw.includes('aguard') || raw.includes('analis')) {
    return 'pending';
  }
  return raw;
}

function formatStatusLabel(value: string) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function statusLabel(status?: Status | null): StatusMeta {
  const normalized = normaliseStatus(status);
  const copy = statusCopy[normalized];
  if (copy) {
    return { value: normalized, label: copy.label, tone: copy.tone };
  }
  const label = formatStatusLabel(normalized);
  return {
    value: normalized,
    label: label || '—',
    tone: 'info',
  };
}

function resolveRowStatus(row: Record<string, unknown> | null | undefined): Status {
  if (!row || typeof row !== 'object') {
    return 'pending';
  }
  for (const field of STATUS_FIELDS) {
    if (field in row && row[field] != null) {
      return normaliseStatus(row[field] as Status);
    }
  }
  return 'pending';
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return value ?? '—';
  }
}

function toneForBanner(severity: Banner['severity']) {
  switch (severity) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'danger';
    default:
      return 'info';
  }
}

function formatCount(value?: number | null) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return numberFormatter.format(value);
  }
  return '0';
}

function formatHours(value?: number | null) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return hourFormatter.format(value);
  }
  return '—';
}

function makeFilenameSegment(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

function escapeHtml(raw: unknown) {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const hourFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });
const dayFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });

type TimelineDatum = AdminApprovalTimelinePoint & { label: string };

type TimelineTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: keyof TimelineDatum;
    color: string;
    payload: TimelineDatum;
  }>;
};

function TimelineTooltip({ active, payload }: TimelineTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload;
  if (!datum) return null;
  return (
    <div className="admin-approvals__tooltip" role="status">
      <p className="admin-approvals__tooltipTitle">{datum.label}</p>
      <dl className="admin-approvals__tooltipList">
        <div>
          <dt>Pedidos</dt>
          <dd>{numberFormatter.format(datum.pending)}</dd>
        </div>
        <div>
          <dt>Aprovações</dt>
          <dd>{numberFormatter.format(datum.approved)}</dd>
        </div>
        <div>
          <dt>Rejeições</dt>
          <dd>{numberFormatter.format(datum.rejected)}</dd>
        </div>
      </dl>
    </div>
  );
}

function HeroMetrics({ metrics }: { metrics: AdminApprovalHeroMetric[] }) {
  if (!metrics.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem indicadores calculados.</p>
      </div>
    );
  }
  return (
    <div className="admin-approvals__heroGrid">
      {metrics.map((metric) => (
        <article key={metric.id} className="admin-approvals__heroCard" data-tone={metric.tone}>
          <span className="admin-approvals__heroLabel">{metric.label}</span>
          <strong className="admin-approvals__heroValue">{metric.value}</strong>
          {metric.helper ? <span className="admin-approvals__heroHelper">{metric.helper}</span> : null}
        </article>
      ))}
    </div>
  );
}

function HighlightsList({ highlights }: { highlights: AdminApprovalHighlight[] }) {
  if (!highlights.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem destaques no momento.</p>
      </div>
    );
  }
  return (
    <ul className="admin-approvals__highlights" role="list">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="admin-approvals__highlight" data-tone={highlight.tone}>
          <span className="admin-approvals__highlightIcon" aria-hidden="true">
            {highlight.tone === 'positive' ? (
              <CheckCircle2 className="neo-icon neo-icon--sm" />
            ) : highlight.tone === 'info' ? (
              <ArrowUpRight className="neo-icon neo-icon--sm" />
            ) : (
              <AlertTriangle className="neo-icon neo-icon--sm" />
            )}
          </span>
          <div>
            <p className="admin-approvals__highlightTitle">{highlight.title}</p>
            <p className="admin-approvals__highlightDescription">{highlight.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TimelineChart({ data }: { data: TimelineDatum[] }) {
  if (!data.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem histórico nos últimos 14 dias.</p>
      </div>
    );
  }
  return (
    <div className="admin-approvals__chart">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--neo-chart-grid)" />
          <XAxis dataKey="label" tickLine={false} stroke="var(--neo-chart-axis)" interval={data.length > 10 ? 1 : 0} />
          <YAxis allowDecimals={false} tickLine={false} stroke="var(--neo-chart-axis)" width={34} />
          <Tooltip content={<TimelineTooltip />} cursor={{ fill: 'var(--neo-chart-cursor)' }} />
          <Area type="monotone" dataKey="pending" stroke="var(--neo-chart-warning)" fill="var(--neo-chart-warning-fill)" />
          <Area type="monotone" dataKey="approved" stroke="var(--neo-chart-success)" fill="var(--neo-chart-success-fill)" />
          <Area type="monotone" dataKey="rejected" stroke="var(--neo-chart-danger)" fill="var(--neo-chart-danger-fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusDistribution({ segments }: { segments: AdminApprovalStatusSegment[] }) {
  if (!segments.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem distribuição disponível.</p>
      </div>
    );
  }
  const total = segments.reduce((acc, segment) => acc + segment.count, 0);
  return (
    <ul className="admin-approvals__distribution" role="list">
      {segments.map((segment) => {
        const percent = total ? Math.round((segment.count / total) * 100) : 0;
        return (
          <li key={segment.id} className="admin-approvals__distributionItem">
            <div>
              <span className="admin-approvals__distributionLabel">{segment.label}</span>
              <span className="admin-approvals__distributionValue">{numberFormatter.format(segment.count)}</span>
            </div>
            <div className="admin-approvals__distributionBar" aria-hidden>
              <span style={{ width: `${percent}%` }} data-tone={segment.tone} />
            </div>
            <span className="admin-approvals__distributionPercent">{percent}%</span>
          </li>
        );
      })}
    </ul>
  );
}

function BacklogList({ rows }: { rows: AdminApprovalBacklogRow[] }) {
  if (!rows.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem pendentes críticos neste momento.</p>
      </div>
    );
  }
  return (
    <ul className="admin-approvals__backlog" role="list">
      {rows.map((row) => {
        const waiting = formatHours(row.waitingHours);
        return (
          <li key={row.id} className="admin-approvals__backlogItem">
            <div className="admin-approvals__backlogMeta">
              <span className="admin-approvals__backlogName">{row.name ?? 'Utilizador sem nome'}</span>
              <span className="admin-approvals__backlogId">ID: {row.userId ?? row.id}</span>
              <span className="admin-approvals__backlogSince">Pedido em {formatDate(row.requestedAt)}</span>
            </div>
            <div className="admin-approvals__backlogWaiting">
              <strong>
                {waiting}
                {waiting !== '—' ? 'h' : ''}
              </strong>
              <span className="neo-text--xs neo-text--muted">
                {waiting !== '—' ? 'em fila' : 'Sem SLA calculado'}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ReviewersList({ reviewers }: { reviewers: AdminApprovalReviewerStat[] }) {
  if (!reviewers.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem revisores activos.</p>
      </div>
    );
  }
  return (
    <ul className="admin-approvals__reviewers" role="list">
      {reviewers.map((reviewer) => {
        const slaHours = formatHours(reviewer.avgSlaHours);
        return (
          <li key={reviewer.id} className="admin-approvals__reviewer">
            <div>
              <span className="admin-approvals__reviewerName">{reviewer.name}</span>
              <span className="admin-approvals__reviewerCount">
                {formatCount(reviewer.approvals)} aprovações
              </span>
            </div>
            <span className="admin-approvals__reviewerSla">
              {slaHours !== '—' ? `${slaHours}h SLA` : 'SLA n/d'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function SlaCard({ sla }: { sla: AdminApprovalSlaOverview }) {
  const average = formatHours(sla.averageHours);
  const percentile90 = formatHours(sla.percentile90Hours);
  return (
    <div className="admin-approvals__sla">
      <div className="admin-approvals__slaPrimary">
        <span className="admin-approvals__slaLabel">SLA médio</span>
        <strong className="admin-approvals__slaValue">
          {average !== '—' ? `${average}h` : '—'}
        </strong>
        <span className="admin-approvals__slaDetail">
          90º percentil: {percentile90 !== '—' ? `${percentile90}h` : '—'}
        </span>
      </div>
      <div className="admin-approvals__slaSplit">
        <span data-tone="positive">{formatCount(sla.within24h)} dentro de 24h</span>
        <span data-tone="danger">{formatCount(sla.breached)} &gt; 24h</span>
      </div>
    </div>
  );
}

export default function ApprovalsClient({ pageSize = 20 }: { pageSize?: number }) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get('q') ?? '';
  const initialStatus = searchParams.get('status');
  const initialPageParam = Number.parseInt(searchParams.get('page') ?? '', 10);
  const initialPageSizeParam = Number.parseInt(searchParams.get('pageSize') ?? '', 10);
  const [q, setQ] = React.useState(initialQuery);
  const [status, setStatus] = React.useState<Status | ''>(() =>
    canonicaliseStatusFilter(initialStatus),
  );
  const [debouncedQ, setDebouncedQ] = React.useState(initialQuery.trim());
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [countReliable, setCountReliable] = React.useState(true);
  const [searchSampleSize, setSearchSampleSize] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(
    Number.isFinite(initialPageParam) && initialPageParam > 0 ? initialPageParam - 1 : 0,
  );
  const [pageSizeState, setPageSizeState] = React.useState(() => {
    if (Number.isFinite(initialPageSizeParam) && PAGE_SIZE_OPTIONS.includes(initialPageSizeParam)) {
      return initialPageSizeParam;
    }
    return pageSize;
  });
  const [loading, setLoading] = React.useState(false);
  const [banner, setBanner] = React.useState<Banner | null>(null);
  const [openInNew, setOpenInNew] = React.useState(false);
  const [undoState, setUndoState] = React.useState<{ row: Row; index: number } | null>(null);
  const activeFetchRef = React.useRef<AbortController | null>(null);
  const lastFetchIdRef = React.useRef(0);
  const undoTimerRef = React.useRef<number | null>(null);
  const [insights, setInsights] = React.useState<AdminApprovalsDashboardData | null>(null);
  const [insightsLoading, setInsightsLoading] = React.useState(false);
  const [insightsError, setInsightsError] = React.useState<string | null>(null);

  const pageSizeValue = React.useMemo(
    () => (pageSizeState > 0 ? pageSizeState : pageSize),
    [pageSizeState, pageSize],
  );

  const totalPages = React.useMemo(() => {
    const baseTotal = countReliable ? count : Math.max(count, rows.length);
    const pages = Math.ceil((baseTotal || rows.length || 0) / pageSizeValue);
    return pages > 0 ? pages : 1;
  }, [count, countReliable, pageSizeValue, rows.length]);

  const metrics = React.useMemo(() => {
    const counts = new Map<Status, number>();
    for (const row of rows) {
      const meta = statusLabel(row.status);
      counts.set(meta.value, (counts.get(meta.value) ?? 0) + 1);
    }

    const ordered: Array<{ id: Status; label: string; value: number; tone: StatusTone }> = [];

    for (const status of CANONICAL_STATUS_ORDER) {
      const meta = statusLabel(status);
      const value = counts.get(meta.value) ?? 0;
      counts.delete(meta.value);
      ordered.push({ id: meta.value, label: meta.label, value, tone: meta.tone });
    }

    const extras = Array.from(counts.entries())
      .map(([value, total]) => {
        const meta = statusLabel(value);
        return { id: meta.value, label: meta.label, value: total, tone: meta.tone };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-PT'));

    return [
      ...ordered,
      ...extras,
      { id: 'total', label: 'Total página', value: rows.length, tone: 'info' as const },
    ];
  }, [rows]);

  const loadInsights = React.useCallback(async ({ signal }: { signal?: AbortSignal } = {}) => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const response = await fetch('/api/admin/approvals/dashboard', {
        cache: 'no-store',
        credentials: 'same-origin',
        signal,
      });
      if (!response.ok) {
        const message = await response.text().catch(() => null);
        throw new Error(message || 'Falha ao carregar as métricas.');
      }
      const payload = (await response.json()) as AdminApprovalsDashboardData | { ok?: boolean; message?: string };
      if (!payload || typeof payload !== 'object' || (payload as any).ok !== true) {
        throw new Error((payload as any)?.message ?? 'Falha ao carregar as métricas.');
      }
      setInsights(payload as AdminApprovalsDashboardData);
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      setInsights(null);
      setInsightsError(error?.message || 'Falha ao carregar as métricas.');
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const timelineData = React.useMemo<TimelineDatum[]>(() => {
    if (!insights?.timeline?.length) return [];
    return insights.timeline.map((point) => {
      const date = new Date(point.date);
      return {
        ...point,
        label: Number.isNaN(date.getTime()) ? point.date : dayFormatter.format(date),
      };
    });
  }, [insights]);

  const supabaseOnline = insights?._supabaseConfigured !== false && insights?.source === 'supabase';
  const statusSegments = insights?.statuses ?? [];
  const highlightList = insights?.highlights ?? [];
  const backlogRows = insights?.backlog ?? [];
  const reviewerRows = insights?.reviewers ?? [];
  const slaData = insights?.sla ?? {
    averageHours: null,
    percentile90Hours: null,
    within24h: 0,
    breached: 0,
  };
  const showInsightsSkeleton = insightsLoading && !insights;

  const statusOptions = React.useMemo(() => {
    const registry = new Map<Status, StatusMeta>();
    CANONICAL_STATUS_ORDER.forEach((status) => {
      const meta = statusLabel(status);
      registry.set(meta.value, meta);
    });
    if (status) {
      const meta = statusLabel(status);
      registry.set(meta.value, meta);
    }
    rows.forEach((row) => {
      const meta = statusLabel(row.status);
      registry.set(meta.value, meta);
    });
    statusSegments.forEach((segment) => {
      const meta = statusLabel(segment.id as Status);
      registry.set(meta.value, meta);
    });
    return Array.from(registry.values()).sort((a, b) => {
      const orderA = CANONICAL_STATUS_ORDER.indexOf(a.value);
      const orderB = CANONICAL_STATUS_ORDER.indexOf(b.value);
      if (orderA !== orderB) {
        return (orderA === -1 ? CANONICAL_STATUS_ORDER.length : orderA) -
          (orderB === -1 ? CANONICAL_STATUS_ORDER.length : orderB);
      }
      return a.label.localeCompare(b.label, 'pt-PT');
    });
  }, [rows, status, statusSegments]);

  const filtersActive = React.useMemo(() => {
    if (page > 0) return true;
    if (status) return true;
    return Boolean(q.trim());
  }, [page, q, status]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQ((prev) => {
        const trimmed = q.trim();
        return prev === trimmed ? prev : trimmed;
      });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [q]);

  React.useEffect(() => {
    const nextQuery = searchParams.get('q') ?? '';
    if (nextQuery !== q) {
      setQ(nextQuery);
    }
    const trimmed = nextQuery.trim();
    if (trimmed !== debouncedQ) {
      setDebouncedQ(trimmed);
    }
    const statusParam = searchParams.get('status');
    const canonicalStatus = canonicaliseStatusFilter(statusParam);
    if (canonicalStatus !== status) {
      setStatus(canonicalStatus);
    }
    const pageParam = Number.parseInt(searchParams.get('page') ?? '', 10);
    const nextPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam - 1 : 0;
    if (nextPage !== page) {
      setPage(nextPage);
    }
    const pageSizeParam = Number.parseInt(searchParams.get('pageSize') ?? '', 10);
    const nextSize =
      Number.isFinite(pageSizeParam) && PAGE_SIZE_OPTIONS.includes(pageSizeParam)
        ? pageSizeParam
        : pageSize;
    if (nextSize !== pageSizeState) {
      setPageSizeState(nextSize);
    }
  }, [pageSize, searchParams]);

  const lastSyncedQueryRef = React.useRef<string>('');

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const queryValue = debouncedQ.trim();
    if (queryValue) {
      params.set('q', queryValue);
    } else {
      params.delete('q');
    }
    const canonicalStatus = canonicaliseStatusFilter(status);
    if (canonicalStatus) {
      params.set('status', canonicalStatus);
    } else {
      params.delete('status');
    }
    const pageParam = page + 1;
    if (pageParam > 1) {
      params.set('page', String(pageParam));
    } else {
      params.delete('page');
    }
    if (pageSizeState !== pageSize) {
      params.set('pageSize', String(pageSizeState));
    } else {
      params.delete('pageSize');
    }
    const nextString = params.toString();
    if (nextString === searchParams.toString()) {
      lastSyncedQueryRef.current = nextString;
      return;
    }
    if (lastSyncedQueryRef.current === nextString) {
      return;
    }
    lastSyncedQueryRef.current = nextString;
    router.replace(`${pathname}${nextString ? `?${nextString}` : ''}`, { scroll: false });
  }, [debouncedQ, page, pageSize, pageSizeState, pathname, router, searchParams, status]);

  const pageSummary = React.useMemo(() => {
    if (!rows.length) {
      return loading ? 'A carregar pedidos…' : 'Nenhum pedido listado.';
    }
    const start = page * pageSizeValue + 1;
    const end = start + rows.length - 1;
    const hasValidTotal = countReliable && Number.isFinite(count) && count > 0;
    const total = hasValidTotal ? count : end;
    const safeStart = hasValidTotal ? Math.min(start, Math.max(1, total - rows.length + 1)) : start;
    const safeEnd = hasValidTotal ? Math.min(total, Math.max(safeStart, end)) : end;
    const baseLabel = `A mostrar ${numberFormatter.format(safeStart)} – ${numberFormatter.format(safeEnd)} de ${numberFormatter.format(
      Math.max(total, rows.length),
    )} pedidos.`;
    const limitedSuffix = countReliable
      ? ''
      : ` Resultados limitados${
          searchSampleSize != null ? ` a ${numberFormatter.format(searchSampleSize)} registos avaliados` : ''
        }.`;
    const label = `${baseLabel}${limitedSuffix}`;
    return loading ? `${label} (a actualizar…)` : label;
  }, [count, countReliable, loading, page, pageSizeValue, rows.length, searchSampleSize]);

  const undoLabel = React.useMemo(() => {
    if (!undoState?.row) return '';
    const label = undoState.row.name ?? undoState.row.email ?? undoState.row.user_id ?? '';
    return typeof label === 'string' ? label : String(label);
  }, [undoState]);

  const clearFilters = React.useCallback(() => {
    setQ('');
    setDebouncedQ('');
    setStatus('');
    setPage(0);
  }, []);

  const fetchRows = React.useCallback(async () => {
    const controller = new AbortController();
    const fetchId = lastFetchIdRef.current + 1;
    lastFetchIdRef.current = fetchId;
    if (activeFetchRef.current) {
      activeFetchRef.current.abort();
    }
    activeFetchRef.current = controller;

    const search = debouncedQ.trim();
    const size = pageSizeValue;
    setLoading(true);
    setBanner(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(size));
      if (search) params.set('q', search);
      if (status) {
        const normalizedStatus = canonicaliseStatusFilter(status);
        if (normalizedStatus) {
          params.set('status', normalizedStatus);
        }
      }

      const response = await fetch(`/api/admin/approvals?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      });

      if (controller.signal.aborted || fetchId !== lastFetchIdRef.current) {
        return;
      }

      if (response.status === 401 || response.status === 403) {
        setRows([]);
        setCount(0);
        setCountReliable(true);
        setSearchSampleSize(null);
        setBanner({
          severity: 'warning',
          message: 'Sessão expirada — autentica-te novamente para gerir os pedidos reais.',
        });
        return;
      }

      if (!response.ok) {
        throw new Error((await response.text()) || 'Falha ao carregar pedidos de aprovação.');
      }

      const payload = (await response.json()) as ApprovalsApiResponse;
      if (controller.signal.aborted || fetchId !== lastFetchIdRef.current) {
        return;
      }

      if (payload._supabaseConfigured === false) {
        setRows([]);
        setCount(0);
        setCountReliable(true);
        setSearchSampleSize(null);
        setBanner({
          severity: 'info',
          message: 'Supabase não está configurado — assim que ligares a base de dados, os pedidos reais vão aparecer aqui.',
        });
        return;
      }

      const mapped: Row[] = (payload.rows ?? []).map((row, index) => {
        const statusValue = resolveRowStatus(row as Record<string, unknown>);
        const requestedAt =
          row?.requested_at ??
          row?.created_at ??
          row?.inserted_at ??
          row?.updated_at ??
          null;
        const rawId = row?.id ?? row?.approval_id ?? row?.user_id ?? row?.uid ?? row?.user ?? row?.member_id ?? '';
        const userIdSource = row?.user_id ?? row?.uid ?? row?.user ?? row?.member_id ?? rawId;
        const trainerIdSource = row?.trainer_id ?? row?.coach_id ?? null;

        return {
          id: String(rawId || `pending-${index}`),
          user_id: String(userIdSource ?? ''),
          trainer_id: trainerIdSource == null ? null : String(trainerIdSource),
          name: (row?.name ?? row?.full_name ?? row?.profile_name ?? null) as string | null,
          email: (row?.email ?? row?.user_email ?? null) as string | null,
          requested_at: requestedAt,
          status: statusValue,
          metadata:
            row && typeof row === 'object' && row?.metadata && typeof row.metadata === 'object'
              ? (row.metadata as Record<string, unknown>)
              : null,
        };
      });

      const totalCountRaw =
        typeof payload.count === 'number' ? payload.count : Number(payload.count ?? Number.NaN);
      const safeCount = Number.isFinite(totalCountRaw) ? totalCountRaw : mapped.length;
      setCount(safeCount);
      if (payload._searchFallback) {
        const sample =
          typeof payload.searchSampleSize === 'number' && Number.isFinite(payload.searchSampleSize)
            ? payload.searchSampleSize
            : mapped.length;
        setCountReliable(false);
        setSearchSampleSize(sample);
        setBanner({
          severity: 'info',
          message: `Pesquisa compatível aplicada localmente — analisados ${numberFormatter.format(
            sample,
          )} registos. Resultados podem estar limitados até ${numberFormatter.format(safeCount)} entradas.`,
        });
      } else {
        setCountReliable(true);
        setSearchSampleSize(null);
      }
      if (page > 0 && mapped.length === 0 && safeCount > 0) {
        const lastPageIndex = Math.max(Math.ceil(safeCount / size) - 1, 0);
        if (lastPageIndex < page) {
          setRows([]);
          setPage(lastPageIndex);
          return;
        }
      }
      setRows(mapped);
      if (payload.error) {
        setBanner({ severity: 'warning', message: 'Alguns pedidos podem não estar disponíveis neste momento.' });
      }
    } catch (error: any) {
      if (controller.signal.aborted || fetchId !== lastFetchIdRef.current) {
        return;
      }
      setRows([]);
      setCount(0);
      setCountReliable(true);
      setSearchSampleSize(null);
      const message = error?.name === 'AbortError' ? null : error?.message;
      setBanner({
        severity: 'error',
        message: message || 'Falha ao carregar pedidos de aprovação. Tenta novamente em instantes.',
      });
    } finally {
      if (activeFetchRef.current === controller) {
        activeFetchRef.current = null;
      }
      if (!controller.signal.aborted && fetchId === lastFetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedQ, page, pageSizeValue, status]);

  React.useEffect(() => {
    void fetchRows();
    return () => {
      activeFetchRef.current?.abort();
    };
  }, [fetchRows]);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadInsights({ signal: controller.signal });
    return () => controller.abort();
  }, [loadInsights]);

  React.useEffect(() => {
    const baseTotal = countReliable ? count : Math.max(count, rows.length);
    const pages = Math.ceil((baseTotal || rows.length || 0) / pageSizeValue);
    if (page >= pages && pages > 0) {
      setPage(Math.max(0, pages - 1));
    }
  }, [count, countReliable, page, pageSizeValue, rows.length]);

  React.useEffect(
    () => () => {
      activeFetchRef.current?.abort();
      if (undoTimerRef.current != null) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    },
    [],
  );

  const clearUndo = React.useCallback(() => {
    if (undoTimerRef.current != null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoState(null);
  }, []);

  const queueUndo = React.useCallback((row: Row, index: number) => {
    if (undoTimerRef.current != null) {
      window.clearTimeout(undoTimerRef.current);
    }
    setUndoState({ row, index });
    undoTimerRef.current = window.setTimeout(() => {
      setUndoState(null);
      undoTimerRef.current = null;
    }, 6000);
  }, []);

  const exportCSV = React.useCallback(() => {
    if (!rows.length) {
      toast.info('Não há pedidos para exportar neste momento.');
      return;
    }
    const header = ['id', 'user_id', 'name', 'email', 'status', 'requested_at'];
    const lines = [
      header.join(','),
      ...rows.map((row) => {
        const statusMeta = statusLabel(row.status);
        return [
          row.id,
          row.user_id,
          row.name ?? '',
          row.email ?? '',
          statusMeta.label,
          row.requested_at ?? '',
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',');
      }),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeStatus = status ? makeFilenameSegment(status) : '';
    const safeQuery = debouncedQ ? makeFilenameSegment(debouncedQ) : '';
    const statusSuffix = safeStatus ? `-${safeStatus}` : '';
    const searchSuffix = safeQuery ? `-q-${safeQuery}` : '';
    a.download = `approvals${statusSuffix}${searchSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação iniciada.');
  }, [rows, status, debouncedQ, toast]);

  const printList = React.useCallback(() => {
    if (!rows.length) {
      toast.info('Não há pedidos para imprimir.');
      return;
    }
    const win = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700');
    if (!win) return;
    const body = rows
      .map((row) => {
        const cells = [
          row.name ?? '',
          row.email ?? '',
          statusLabel(row.status).label,
          row.requested_at ? formatDate(row.requested_at) : '',
        ]
          .map((cell) => `<td>${escapeHtml(cell)}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charSet="utf-8" />
<title>Aprovações</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:16px;color:#111827;background:#f8fafc;}
 h1{font-size:18px;margin:0 0 12px;font-weight:600;}
 table{width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;}
 th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;font-size:12px;}
 th{background:#eef2ff;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;font-size:11px;}
</style>
</head>
<body>
<h1>Pedidos de aprovação</h1>
<table>
<thead><tr><th>Nome</th><th>Email</th><th>Estado</th><th>Pedido em</th></tr></thead>
<tbody>${body}</tbody>
</table>
<script>window.addEventListener('load',function(){window.print();});</script>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  }, [rows, toast]);

  const approveRow = React.useCallback(async (row: Row) => {
    try {
      const res = await fetch(`/api/admin/approvals/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Aprovação concluída.');
      void fetchRows();
      void loadInsights();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao aprovar pedido.');
    }
  }, [fetchRows, loadInsights, toast]);

  const deleteRow = React.useCallback(async (row: Row) => {
    if (!window.confirm(`Remover pedido de ${row.email || row.name || row.id}?`)) return;

    let originalIndex = 0;
    setRows((prev) => {
      const index = prev.findIndex((item) => item.id === row.id);
      originalIndex = index === -1 ? prev.length : index;
      queueUndo(row, originalIndex);
      return prev.filter((item) => item.id !== row.id);
    });

    try {
      const res = await fetch(`/api/admin/approvals/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast.info('Pedido removido.');
      void loadInsights();
      void fetchRows();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao remover pedido.');
      clearUndo();
      setRows((prev) => {
        const next = [...prev];
        next.splice(Math.min(originalIndex, next.length), 0, row);
        return next;
      });
    }
  }, [clearUndo, fetchRows, loadInsights, queueUndo, toast]);

  const undoDelete = React.useCallback(async () => {
    if (!undoState) return;
    const { row, index } = undoState;
    if (undoTimerRef.current != null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoState(null);
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: row.user_id,
          trainer_id: row.trainer_id,
          name: row.name,
          email: row.email,
          status: row.status,
          requested_at: row.requested_at ?? undefined,
          metadata: row.metadata ?? undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Pedido restaurado.');
      setRows((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, row);
        return next;
      });
      void fetchRows();
      void loadInsights();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao restaurar o pedido.');
      queueUndo(row, index);
    }
  }, [fetchRows, loadInsights, queueUndo, toast, undoState]);

  return (
    <div className="admin-page neo-stack neo-stack--xl">
      <PageHeader
        title="Gestão de aprovações"
        subtitle="Filtra, aprova ou rejeita rapidamente os pedidos de acesso de treinadores e clientes."
        actions={(
          <div className="neo-quick-actions">
            <OpenInNewToggle checked={openInNew} onChange={setOpenInNew} label="Abrir perfis noutra aba" />
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={() => {
                void fetchRows();
                void loadInsights();
              }}
              disabled={loading}
            >
              <span className="btn__icon">
                <RefreshCcw className="neo-icon neo-icon--sm" aria-hidden="true" />
              </span>
              <span className="btn__label">Actualizar</span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={exportCSV}
              disabled={!rows.length}
            >
              <span className="btn__icon">
                <Download className="neo-icon neo-icon--sm" aria-hidden="true" />
              </span>
              <span className="btn__label">Exportar CSV</span>
            </button>
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={printList}
              disabled={!rows.length}
            >
              <span className="btn__icon">
                <Printer className="neo-icon neo-icon--sm" aria-hidden="true" />
              </span>
              <span className="btn__label">Imprimir</span>
            </button>
          </div>
        )}
      />

      {banner && (
        <div
          className="neo-surface neo-surface--compact"
          data-variant={toneForBanner(banner.severity)}
          role="status"
          aria-live="polite"
        >
          <p className="neo-text--sm text-fg">{banner.message}</p>
        </div>
      )}

      <section className="neo-panel neo-stack neo-stack--lg admin-approvals__dashboard" aria-label="Métricas de aprovações">
        <div className="admin-approvals__dashboardHeader">
          <div>
            <h2 className="admin-approvals__dashboardTitle">Métricas operacionais</h2>
            <p className="admin-approvals__dashboardSubtitle">Monitoriza o fluxo de pedidos, SLA e desempenho da equipa de revisão.</p>
          </div>
          <div className="admin-approvals__dashboardMeta">
            <DataSourceBadge
              source={insights?.source}
              generatedAt={insights?.generatedAt ?? null}
              className="neo-data-badge"
            />
            <span className="admin-approvals__dataset neo-text--xs neo-text--muted">
              {showInsightsSkeleton
                ? 'A sincronizar métricas…'
                : `A mostrar ${numberFormatter.format(insights?.sampleSize ?? 0)} de ${numberFormatter.format(insights?.datasetSize ?? 0)} registos.`}
              {supabaseOnline ? ' Supabase activo.' : ' Modo determinístico.'}
            </span>
          </div>
        </div>

        {insightsError && !showInsightsSkeleton ? (
          <div className="neo-surface neo-surface--compact" data-variant="warning" role="status">
            <p className="neo-text--sm text-fg">{insightsError}</p>
          </div>
        ) : null}

        {showInsightsSkeleton ? (
          <div className="neo-inline neo-inline--center neo-inline--sm neo-text--sm neo-text--muted" role="status">
            <span className="neo-spinner" aria-hidden /> A calcular métricas…
          </div>
        ) : (
          <>
            <HeroMetrics metrics={insights?.hero ?? []} />
            <div className="admin-approvals__dashboardGrid">
              <TimelineChart data={timelineData} />
              <HighlightsList highlights={highlightList} />
            </div>
            <div className="admin-approvals__dashboardGrid admin-approvals__dashboardGrid--secondary">
              <StatusDistribution segments={statusSegments} />
              <SlaCard sla={slaData} />
            </div>
            <div className="admin-approvals__dashboardGrid admin-approvals__dashboardGrid--tertiary">
              <BacklogList rows={backlogRows} />
              <ReviewersList reviewers={reviewerRows} />
            </div>
          </>
        )}
      </section>

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Filtros e indicadores">
        <div className="admin-approvals__metrics">
          {metrics.map((metric) => (
            <div key={metric.id} className="admin-approvals__metric" data-tone={metric.tone}>
              <span className="admin-approvals__metricLabel">{metric.label}</span>
              <span className="admin-approvals__metricValue">{metric.value}</span>
            </div>
          ))}
        </div>

        <div className="admin-approvals__filters" role="group" aria-label="Filtros de pesquisa">
          <label htmlFor="approvals-search" className="admin-approvals__field">
            <span className="admin-approvals__label">Pesquisa</span>
            <div className="admin-approvals__search">
              <Search className="admin-approvals__searchIcon" aria-hidden="true" />
              <input
                id="approvals-search"
                type="search"
                className="neo-field admin-approvals__searchInput"
                placeholder="Nome ou email"
                value={q}
                onChange={(event) => {
                  setQ(event.target.value);
                  setPage(0);
                }}
              />
            </div>
          </label>

          <label htmlFor="approvals-status" className="admin-approvals__field">
            <span className="admin-approvals__label">Estado</span>
            <select
              id="approvals-status"
              className="neo-field"
              value={status}
              onChange={(event) => {
                const next = canonicaliseStatusFilter(event.target.value);
                setStatus(next);
                setPage(0);
              }}
            >
              <option value="">Todos</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="approvals-page-size" className="admin-approvals__field">
            <span className="admin-approvals__label">Linhas por página</span>
            <select
              id="approvals-page-size"
              className="neo-field"
              value={pageSizeState}
              onChange={(event) => {
                const parsed = Number(event.target.value) || pageSize;
                const next = PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : pageSize;
                setPageSizeState(next);
                setPage(0);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>

          <div className="admin-approvals__field admin-approvals__field--shortcut">
            <span className="admin-approvals__label">Atalhos</span>
            <div className="neo-inline neo-inline--sm neo-inline--start">
              <Link href="/dashboard/admin/users" className="btn" data-variant="ghost" prefetch={false}>
                <span className="btn__icon">
                  <ArrowUpRight className="neo-icon neo-icon--sm" aria-hidden="true" />
                </span>
                <span className="btn__label">Ver utilizadores</span>
              </Link>
              <button
                type="button"
                className="btn"
                data-variant="ghost"
                onClick={clearFilters}
                disabled={!filtersActive}
              >
                <span className="btn__icon">
                  <Eraser className="neo-icon neo-icon--sm" aria-hidden="true" />
                </span>
                <span className="btn__label">Limpar filtros</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Tabela de pedidos">
        <header className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
          <div className="neo-stack neo-stack--xs">
            <h2 className="neo-panel__title">Pedidos activos</h2>
            <p className="neo-panel__subtitle">Actualiza em tempo real quando alteras filtros ou navegas pelas páginas.</p>
          </div>
          <span className="neo-tag" data-tone="primary" aria-live="polite">
            {(() => {
              const totalValue = countReliable ? count : Math.max(count, rows.length);
              const formatted = countReliable ? formatCount(totalValue) : `≥ ${formatCount(totalValue)}`;
              const suffix = totalValue === 1 ? 'pedido' : 'pedidos';
              const qualifier = countReliable ? '' : ' (estimativa)';
              return `${formatted} ${suffix}${qualifier}`;
            })()}
          </span>
        </header>

        <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--sm" role="status" aria-live="polite">
          <span className="neo-text--sm neo-text--muted">{pageSummary}</span>
          <span className="neo-text--xs neo-text--muted">Página {page + 1} de {totalPages}</span>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table" aria-busy={loading}>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Email</th>
                <th scope="col">Estado</th>
                <th scope="col">Pedido em</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Acções
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="neo-table-empty">
                      <div className="neo-inline neo-inline--center neo-inline--sm neo-text--sm neo-text--muted">
                        <span className="neo-spinner" aria-hidden /> A sincronizar pedidos…
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="neo-table-empty">
                      Nenhum pedido encontrado. Ajusta os filtros ou tenta novamente mais tarde.
                    </div>
                  </td>
                </tr>
              )}

              {!loading && rows.map((row) => {
                const meta = statusLabel(row.status);
                return (
                  <tr key={row.id}>
                    <td data-title="Nome">
                      <div className="neo-stack neo-stack--xs">
                        <span className="neo-text--sm neo-text--semibold text-fg">{row.name ?? '—'}</span>
                        <span className="neo-text--xs neo-text--muted">ID: {row.user_id}</span>
                      </div>
                    </td>
                    <td data-title="Email">
                      <span className="neo-text--sm text-fg">{row.email ?? '—'}</span>
                    </td>
                    <td data-title="Estado">
                      <span className="neo-table__status" data-state={meta.tone} data-status={meta.value}>
                        {meta.label}
                      </span>
                    </td>
                    <td data-title="Pedido em">{row.requested_at ? formatDate(row.requested_at) : '—'}</td>
                    <td data-title="Acções" style={{ textAlign: 'right' }}>
                      <div className="neo-inline neo-inline--end neo-inline--sm">
                        <button
                          type="button"
                          className="btn"
                          data-variant="ghost"
                          onClick={() => navigate(`/dashboard/admin/users/${row.user_id}`, openInNew)}
                          title="Ver utilizador"
                        >
                          <ArrowUpRight className="neo-icon neo-icon--sm" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn"
                          data-variant="ghost"
                          onClick={() => { void approveRow(row); }}
                          title="Aprovar"
                        >
                          <CheckCircle2 className="neo-icon neo-icon--sm" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn"
                          data-variant="ghost"
                          onClick={() => { void deleteRow(row); }}
                          title="Remover"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 className="neo-icon neo-icon--sm" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
          <span className="neo-text--sm neo-text--muted">
            Página {page + 1} de {totalPages}
          </span>
          <div className="neo-inline neo-inline--sm">
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              data-size="sm"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0 || loading}
            >
              Anterior
            </button>
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              data-size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Seguinte
            </button>
          </div>
        </div>
      </section>

      {undoState && (
        <div className="neo-panel neo-panel--compact" role="status">
          <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
            <span className="neo-text--sm neo-text--semibold text-fg">
              Pedido removido{undoLabel ? ` de ${undoLabel}` : ''}. Tens alguns segundos para desfazer.
            </span>
            <div className="neo-inline neo-inline--sm">
              <button type="button" className="btn" onClick={() => { void undoDelete(); }}>
                Desfazer
              </button>
              <button type="button" className="btn" data-variant="ghost" onClick={clearUndo}>
                Ignorar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
