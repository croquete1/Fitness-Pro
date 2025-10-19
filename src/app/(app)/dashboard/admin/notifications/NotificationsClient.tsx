'use client';

import * as React from 'react';
import {
  ArrowUpRight,
  Download,
  MailCheck,
  Printer,
  RefreshCcw,
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
  AdminNotificationsDashboardData,
  AdminNotificationHeroMetric,
  AdminNotificationHighlight,
  AdminNotificationTimelinePoint,
  AdminNotificationDistributionSegment,
  AdminNotificationChannelShare,
  AdminNotificationCampaignStat,
  AdminNotificationBacklogRow,
} from '@/lib/admin/notifications/types';

type Row = {
  id: string;
  user_id?: string | null;
  title?: string | null;
  body?: string | null;
  type?: string | null;
  read?: boolean | null;
  created_at?: string | null;
};

type Banner = { message: string; severity: 'info' | 'success' | 'warning' | 'error' };

type UndoState = { row: Row; timer?: number } | null;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function toneForType(type?: string | null) {
  if (!type) return 'neutral';
  const normalized = type.toLowerCase();
  if (normalized.includes('alert') || normalized.includes('erro')) return 'danger';
  if (normalized.includes('reminder') || normalized.includes('check')) return 'warning';
  if (normalized.includes('info') || normalized.includes('update')) return 'info';
  if (normalized.includes('success') || normalized.includes('ok')) return 'success';
  return 'primary';
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

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });
const dayFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });

type TimelineDatum = AdminNotificationTimelinePoint & { label: string };

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
    <div className="admin-notifications__tooltip" role="status">
      <p className="admin-notifications__tooltipTitle">{datum.label}</p>
      <dl className="admin-notifications__tooltipList">
        <div>
          <dt>Enviadas</dt>
          <dd>{numberFormatter.format(datum.sent)}</dd>
        </div>
        <div>
          <dt>Lidas</dt>
          <dd>{numberFormatter.format(datum.read)}</dd>
        </div>
        <div>
          <dt>Por ler</dt>
          <dd>{numberFormatter.format(datum.unread)}</dd>
        </div>
      </dl>
    </div>
  );
}

function HeroMetrics({ metrics }: { metrics: AdminNotificationHeroMetric[] }) {
  if (!metrics.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem métricas calculadas.</p>
      </div>
    );
  }
  return (
    <div className="admin-notifications__heroGrid">
      {metrics.map((metric) => (
        <article key={metric.id} className="admin-notifications__heroCard" data-tone={metric.tone}>
          <span className="admin-notifications__heroLabel">{metric.label}</span>
          <strong className="admin-notifications__heroValue">{metric.value}</strong>
          {metric.helper ? <span className="admin-notifications__heroHelper">{metric.helper}</span> : null}
        </article>
      ))}
    </div>
  );
}

function HighlightsList({ highlights }: { highlights: AdminNotificationHighlight[] }) {
  if (!highlights.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem destaques no momento.</p>
      </div>
    );
  }
  return (
    <ul className="admin-notifications__highlights" role="list">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="admin-notifications__highlight" data-tone={highlight.tone}>
          <span className="admin-notifications__highlightIcon" aria-hidden="true">
            {highlight.tone === 'positive' ? (
              <MailCheck className="neo-icon neo-icon--sm" />
            ) : highlight.tone === 'danger' ? (
              <Trash2 className="neo-icon neo-icon--sm" />
            ) : (
              <ArrowUpRight className="neo-icon neo-icon--sm" />
            )}
          </span>
          <div>
            <p className="admin-notifications__highlightTitle">{highlight.title}</p>
            <p className="admin-notifications__highlightDescription">{highlight.description}</p>
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
        <p className="neo-text--muted">Sem histórico recente.</p>
      </div>
    );
  }
  return (
    <div className="admin-notifications__chart">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--neo-chart-grid)" />
          <XAxis dataKey="label" tickLine={false} stroke="var(--neo-chart-axis)" interval={data.length > 10 ? 1 : 0} />
          <YAxis allowDecimals={false} tickLine={false} stroke="var(--neo-chart-axis)" width={34} />
          <Tooltip content={<TimelineTooltip />} cursor={{ fill: 'var(--neo-chart-cursor)' }} />
          <Area type="monotone" dataKey="sent" stroke="var(--neo-chart-primary)" fill="var(--neo-chart-primary-fill)" />
          <Area type="monotone" dataKey="read" stroke="var(--neo-chart-success)" fill="var(--neo-chart-success-fill)" />
          <Area type="monotone" dataKey="unread" stroke="var(--neo-chart-warning)" fill="var(--neo-chart-warning-fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TypeDistribution({ segments }: { segments: AdminNotificationDistributionSegment[] }) {
  if (!segments.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem distribuição por tipo.</p>
      </div>
    );
  }
  const total = segments.reduce((acc, segment) => acc + segment.count, 0);
  return (
    <ul className="admin-notifications__distribution" role="list">
      {segments.map((segment) => {
        const percent = total ? Math.round((segment.count / total) * 100) : 0;
        return (
          <li key={segment.id} className="admin-notifications__distributionItem">
            <div>
              <span className="admin-notifications__distributionLabel">{segment.label}</span>
              <span className="admin-notifications__distributionValue">{numberFormatter.format(segment.count)}</span>
            </div>
            <div className="admin-notifications__distributionBar" aria-hidden>
              <span style={{ width: `${percent}%` }} data-tone={segment.tone} />
            </div>
            <span className="admin-notifications__distributionPercent">{percent}%</span>
          </li>
        );
      })}
    </ul>
  );
}

function ChannelList({ channels }: { channels: AdminNotificationChannelShare[] }) {
  if (!channels.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Nenhum canal com actividade recente.</p>
      </div>
    );
  }
  const total = channels.reduce((acc, channel) => acc + channel.count, 0);
  return (
    <ul className="admin-notifications__channels" role="list">
      {channels.map((channel) => {
        const percent = total ? Math.round((channel.count / total) * 100) : 0;
        return (
          <li key={channel.id} className="admin-notifications__channel">
            <span className="admin-notifications__channelName">{channel.label}</span>
            <span className="admin-notifications__channelCount">{numberFormatter.format(channel.count)} envios</span>
            <span className="admin-notifications__channelPercent">{percent}%</span>
          </li>
        );
      })}
    </ul>
  );
}

function CampaignList({ campaigns }: { campaigns: AdminNotificationCampaignStat[] }) {
  if (!campaigns.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem campanhas registadas.</p>
      </div>
    );
  }
  return (
    <table className="admin-notifications__campaigns">
      <thead>
        <tr>
          <th>Campanha</th>
          <th>Enviadas</th>
          <th>Lidas</th>
          <th>Taxa</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((campaign) => (
          <tr key={campaign.id}>
            <td>{campaign.title}</td>
            <td>{numberFormatter.format(campaign.sent)}</td>
            <td>{numberFormatter.format(campaign.read)}</td>
            <td>{campaign.openRate != null ? `${percentFormatter.format(campaign.openRate)}%` : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BacklogList({ rows }: { rows: AdminNotificationBacklogRow[] }) {
  if (!rows.length) {
    return (
      <div className="neo-empty" role="status">
        <p className="neo-text--muted">Sem notificações pendentes.</p>
      </div>
    );
  }
  return (
    <ul className="admin-notifications__backlog" role="list">
      {rows.map((row) => (
        <li key={row.id} className="admin-notifications__backlogItem">
          <div className="admin-notifications__backlogMeta">
            <span className="admin-notifications__backlogTitle">{row.title ?? 'Sem título'}</span>
            <span className="admin-notifications__backlogUser">Utilizador: {row.userId ?? '—'}</span>
            <span className="admin-notifications__backlogSince">Enviada em {row.createdAt ? dayFormatter.format(new Date(row.createdAt)) : '—'}</span>
          </div>
          <strong className="admin-notifications__backlogWaiting">{numberFormatter.format(Math.round(row.waitingHours))}h</strong>
        </li>
      ))}
    </ul>
  );
}

export default function NotificationsClient({ pageSize = 20 }: { pageSize?: number }) {
  const toast = useToast();
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('');
  const [onlyUnread, setOnlyUnread] = React.useState(false);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [pageSizeState, setPageSizeState] = React.useState(pageSize);
  const [loading, setLoading] = React.useState(false);
  const [banner, setBanner] = React.useState<Banner | null>(null);
  const [openInNew, setOpenInNew] = React.useState(false);
  const undoRef = React.useRef<UndoState>(null);
  const [, forceUpdate] = React.useReducer((n) => n + 1, 0);
  const [insights, setInsights] = React.useState<AdminNotificationsDashboardData | null>(null);
  const [insightsLoading, setInsightsLoading] = React.useState(false);
  const [insightsError, setInsightsError] = React.useState<string | null>(null);

  const totalPages = React.useMemo(() => {
    const size = pageSizeState > 0 ? pageSizeState : pageSize;
    const pages = Math.ceil((count || 0) / size);
    return pages > 0 ? pages : 1;
  }, [count, pageSizeState, pageSize]);

  const metrics = React.useMemo(() => {
    const unread = rows.filter((row) => !row.read).length;
    const filterLabel = [
      type ? `Tipo: ${type}` : null,
      onlyUnread ? 'Só por ler' : null,
      q.trim() ? `Pesquisa activa` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'Sem filtros adicionais';
    return [
      { id: 'unread', label: 'Por ler (página)', value: unread, tone: 'warning' as const },
      { id: 'listed', label: 'Notificações listadas', value: rows.length, tone: 'primary' as const },
      { id: 'filters', label: 'Filtro activo', value: filterLabel, tone: 'info' as const },
    ];
  }, [rows, type, onlyUnread, q]);

  const loadInsights = React.useCallback(async ({ signal }: { signal?: AbortSignal } = {}) => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const response = await fetch('/api/admin/notifications/dashboard', {
        cache: 'no-store',
        credentials: 'same-origin',
        signal,
      });
      if (!response.ok) {
        const message = await response.text().catch(() => null);
        throw new Error(message || 'Falha ao carregar métricas.');
      }
      const payload = (await response.json()) as AdminNotificationsDashboardData | { ok?: boolean; message?: string };
      if (!payload || typeof payload !== 'object' || (payload as any).ok !== true) {
        throw new Error((payload as any)?.message ?? 'Falha ao carregar métricas.');
      }
      setInsights(payload as AdminNotificationsDashboardData);
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      setInsights(null);
      setInsightsError(error?.message || 'Falha ao carregar métricas.');
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
  const typeSegments = insights?.types ?? [];
  const channelSegments = insights?.channels ?? [];
  const campaignRows = insights?.campaigns ?? [];
  const backlogRows = insights?.backlog ?? [];
  const showInsightsSkeleton = insightsLoading && !insights;
  const datasetSummary = insights
    ? `A mostrar ${numberFormatter.format(insights.sampleSize)} de ${numberFormatter.format(insights.datasetSize)} notificações.`
    : 'Sem métricas calculadas.';

  const fetchRows = React.useCallback(async () => {
    const search = q.trim();
    setLoading(true);
    setBanner(null);
    try {
      const u = new URL('/api/admin/notifications', window.location.origin);
      u.searchParams.set('page', String(page));
      u.searchParams.set('pageSize', String(pageSizeState));
      if (search) u.searchParams.set('q', search);
      if (type) u.searchParams.set('type', type);
      if (onlyUnread) u.searchParams.set('unread', 'true');

      const response = await fetch(u.toString(), { cache: 'no-store', credentials: 'same-origin' });
      if (response.status === 401 || response.status === 403) {
        setRows([]);
        setCount(0);
        setBanner({ severity: 'warning', message: 'Sessão expirada — inicia sessão novamente para ver notificações reais.' });
        return;
      }
      if (!response.ok) {
        throw new Error((await response.text()) || 'Falha ao carregar notificações.');
      }

      const payload = await response.json();
      setRows(
        (payload.rows ?? []).map((n: any) => ({
          id: String(n.id),
          user_id: n.user_id ?? n.uid ?? null,
          title: n.title ?? n.subject ?? '',
          body: n.body ?? n.message ?? '',
          type: n.type ?? n.kind ?? '',
          read: Boolean(n.read ?? n.is_read ?? false),
          created_at: n.created_at ?? null,
        })),
      );
      setCount(payload.count ?? 0);
    } catch (error: any) {
      setRows([]);
      setCount(0);
      setBanner({ severity: 'error', message: error?.message || 'Falha ao carregar notificações.' });
    } finally {
      setLoading(false);
    }
  }, [q, type, onlyUnread, page, pageSizeState]);

  React.useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadInsights({ signal: controller.signal });
    return () => controller.abort();
  }, [loadInsights]);

  React.useEffect(() => {
    const size = pageSizeState > 0 ? pageSizeState : pageSize;
    const pages = Math.ceil((count || 0) / size);
    if (page >= pages && pages > 0) {
      setPage(Math.max(0, pages - 1));
    }
  }, [count, page, pageSizeState, pageSize]);

  React.useEffect(() => () => {
    if (undoRef.current?.timer) window.clearTimeout(undoRef.current.timer);
  }, []);

  const scheduleUndoClear = React.useCallback(() => {
    if (undoRef.current?.timer) window.clearTimeout(undoRef.current.timer);
    if (undoRef.current) {
      undoRef.current.timer = window.setTimeout(() => {
        undoRef.current = null;
        forceUpdate();
      }, 6000);
    }
  }, []);

  const exportCSV = React.useCallback(() => {
    if (!rows.length) {
      toast.info('Não há notificações para exportar.');
      return;
    }
    const header = ['id', 'title', 'type', 'read', 'created_at', 'body'];
    const lines = [
      header.join(','),
      ...rows.map((row) => [
        row.id,
        row.title ?? '',
        row.type ?? '',
        row.read ? 'true' : 'false',
        row.created_at ?? '',
        (row.body ?? '').replace(/\r?\n/g, ' '),
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications${type ? `-${type}` : ''}${onlyUnread ? '-unread' : ''}${q ? `-q-${q}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação iniciada.');
  }, [rows, type, onlyUnread, q, toast]);

  const printList = React.useCallback(() => {
    if (!rows.length) {
      toast.info('Não há notificações para imprimir.');
      return;
    }
    const win = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700');
    if (!win) return;
    const body = rows.map((row) => {
      const cells = [
        row.title ?? '',
        row.type ?? '',
        row.read ? 'Sim' : 'Não',
        row.created_at ? formatDate(row.created_at) : '',
        (row.body ?? '').replace(/\r?\n/g, ' '),
      ].map((cell) => `<td>${String(cell)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charSet="utf-8" />
<title>Notificações</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:16px;color:#111827;background:#f8fafc;}
 h1{font-size:18px;margin:0 0 12px;font-weight:600;}
 table{width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;}
 th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;font-size:12px;}
 th{background:#eef2ff;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;font-size:11px;}
 td:last-child{max-width:360px;}
</style>
</head>
<body>
<h1>Notificações</h1>
<table>
<thead><tr><th>Título</th><th>Tipo</th><th>Lida</th><th>Criada</th><th>Mensagem</th></tr></thead>
<tbody>${body}</tbody>
</table>
<script>window.addEventListener('load',function(){window.print();});</script>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  }, [rows, toast]);

  const markAsRead = React.useCallback(async (row: Row) => {
    try {
      const res = await fetch(`/api/admin/notifications/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Notificação marcada como lida.');
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, read: true } : item)));
      void loadInsights();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao marcar notificação.');
    }
  }, [loadInsights, toast]);

  const deleteRow = React.useCallback(async (row: Row) => {
    if (!window.confirm(`Remover notificação "${row.title || row.id}"?`)) return;
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    if (undoRef.current?.timer) window.clearTimeout(undoRef.current.timer);
    undoRef.current = { row };
    forceUpdate();
    scheduleUndoClear();
    try {
      const res = await fetch(`/api/admin/notifications/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast.info('Notificação removida.');
      void loadInsights();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao remover notificação.');
      undoRef.current = null;
      forceUpdate();
      setRows((prev) => [row, ...prev]);
    }
  }, [loadInsights, scheduleUndoClear, toast]);

  const undoDelete = React.useCallback(async () => {
    const state = undoRef.current;
    if (!state) return;
    if (state.timer) window.clearTimeout(state.timer);
    undoRef.current = null;
    forceUpdate();
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: state.row.user_id ?? null,
          title: state.row.title ?? '',
          body: state.row.body ?? '',
          type: state.row.type ?? 'info',
          read: Boolean(state.row.read),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Notificação restaurada.');
      void fetchRows();
      void loadInsights();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao restaurar notificação.');
    }
  }, [fetchRows, loadInsights, toast]);

  const clearUndo = React.useCallback(() => {
    const state = undoRef.current;
    if (state?.timer) window.clearTimeout(state.timer);
    undoRef.current = null;
    forceUpdate();
  }, []);

  return (
    <div className="admin-page neo-stack neo-stack--xl">
      <PageHeader
        title="Centro de notificações"
        subtitle="Monitoriza alertas transaccionais, campanhas e mensagens de sistema com visual futurista."
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

      <section className="neo-panel neo-stack neo-stack--lg admin-notifications__dashboard" aria-label="Métricas de notificações">
        <div className="admin-notifications__dashboardHeader">
          <div>
            <h2 className="admin-notifications__dashboardTitle">Performance de notificações</h2>
            <p className="admin-notifications__dashboardSubtitle">Acompanha envios, leituras e backlog em tempo real.</p>
          </div>
          <div className="admin-notifications__dashboardMeta">
            <DataSourceBadge
              source={insights?.source}
              generatedAt={insights?.generatedAt ?? null}
              className="neo-data-badge"
            />
            <span className="admin-notifications__dataset neo-text--xs neo-text--muted">
              {showInsightsSkeleton ? 'A sincronizar métricas…' : datasetSummary}
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
            <div className="admin-notifications__dashboardGrid">
              <TimelineChart data={timelineData} />
              <HighlightsList highlights={insights?.highlights ?? []} />
            </div>
            <div className="admin-notifications__dashboardGrid admin-notifications__dashboardGrid--secondary">
              <TypeDistribution segments={typeSegments} />
              <ChannelList channels={channelSegments} />
            </div>
            <div className="admin-notifications__dashboardGrid admin-notifications__dashboardGrid--tertiary">
              <CampaignList campaigns={campaignRows} />
              <BacklogList rows={backlogRows} />
            </div>
          </>
        )}
      </section>

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Indicadores e filtros">
        <div className="neo-grid neo-grid--auto admin-notifications__metrics">
          {metrics.map((metric) => {
            const metricValue = metric.value;
            const isNumeric = typeof metricValue === 'number';
            return (
              <article
                key={metric.id}
                className="neo-surface neo-surface--interactive admin-notifications__metric"
                data-variant={metric.tone}
              >
                <span className="neo-surface__hint">{metric.label}</span>
                {isNumeric ? (
                  <span className="neo-surface__value admin-notifications__metricValue">{metricValue}</span>
                ) : (
                  <span className="admin-notifications__metricLabel">{metricValue}</span>
                )}
              </article>
            );
          })}
        </div>

        <div className="neo-filters-grid admin-notifications__filters" role="group" aria-label="Filtros de notificações">
          <label htmlFor="notifications-search" className="admin-notifications__field">
            <span className="admin-notifications__label">Pesquisar</span>
            <input
              id="notifications-search"
              type="search"
              className="neo-input"
              placeholder="Título ou conteúdo"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(0);
              }}
            />
          </label>

          <label htmlFor="notifications-type" className="admin-notifications__field">
            <span className="admin-notifications__label">Tipo</span>
            <input
              id="notifications-type"
              type="text"
              className="neo-input"
              placeholder="ex.: alert, info, campaign"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(0);
              }}
            />
          </label>

          <label className="admin-notifications__switch">
            <input
              type="checkbox"
              className="neo-toggle"
              role="switch"
              data-state={onlyUnread ? 'on' : 'off'}
              aria-checked={onlyUnread}
              onChange={(event) => {
                setOnlyUnread(event.target.checked);
                setPage(0);
              }}
            />
            <span className="admin-notifications__label">Apenas por ler</span>
          </label>

          <label htmlFor="notifications-page-size" className="admin-notifications__field">
            <span className="admin-notifications__label">Linhas por página</span>
            <select
              id="notifications-page-size"
              className="neo-input"
              value={pageSizeState}
              onChange={(event) => {
                const next = Number(event.target.value) || pageSize;
                setPageSizeState(next);
                setPage(0);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Tabela de notificações">
        <header className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
          <div className="neo-stack neo-stack--xs">
            <h2 className="neo-panel__title">Histórico de envios</h2>
            <p className="neo-panel__subtitle">Visualiza em detalhe as mensagens entregues recentemente.</p>
          </div>
          <span className="neo-tag" data-tone="primary">
            {count} {count === 1 ? 'notificação' : 'notificações'}
          </span>
        </header>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Tipo</th>
                <th scope="col">Estado</th>
                <th scope="col">Criada em</th>
                <th scope="col">Mensagem</th>
                <th scope="col" style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-table-empty">
                      <div className="neo-inline neo-inline--center neo-inline--sm neo-text--sm neo-text--muted">
                        <span className="neo-spinner" aria-hidden /> A carregar notificações…
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-table-empty">
                      Nenhuma notificação encontrada. Ajusta os filtros ou cria uma nova campanha.
                    </div>
                  </td>
                </tr>
              )}

              {!loading && rows.map((row) => (
                <tr key={row.id}>
                  <td data-title="Título">
                    <div className="neo-stack neo-stack--xs">
                      <span className="neo-text--semibold text-fg">{row.title || '—'}</span>
                      {row.user_id && (
                        <button
                          type="button"
                          className="btn"
                          data-variant="ghost"
                          data-size="sm"
                          onClick={() => navigate(`/dashboard/admin/users/${row.user_id}`, openInNew)}
                        >
                          <span className="btn__icon">
                            <ArrowUpRight className="neo-icon neo-icon--sm" aria-hidden="true" />
                          </span>
                          <span className="btn__label">Ver utilizador</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td data-title="Tipo">
                    <span className="neo-tag" data-tone={toneForType(row.type)}>{row.type || '—'}</span>
                  </td>
                  <td data-title="Estado">
                    <span className="neo-table__status" data-state={row.read ? 'success' : 'warning'}>
                      {row.read ? 'Lida' : 'Por ler'}
                    </span>
                  </td>
                  <td data-title="Criada em">{row.created_at ? formatDate(row.created_at) : '—'}</td>
                  <td data-title="Mensagem">
                    <p className="admin-notifications__excerpt">{row.body || '—'}</p>
                  </td>
                  <td data-title="Ações" style={{ textAlign: 'right' }}>
                    <div className="neo-inline neo-inline--wrap neo-inline--end neo-inline--sm">
                      <button
                        type="button"
                        className="btn"
                        data-variant="ghost"
                        data-size="sm"
                        onClick={() => { void markAsRead(row); }}
                        disabled={Boolean(row.read)}
                        title="Marcar como lida"
                      >
                        <span className="btn__icon">
                          <MailCheck className="neo-icon neo-icon--sm" aria-hidden="true" />
                        </span>
                      </button>
                      <button
                        type="button"
                        className="btn"
                        data-variant="ghost"
                        data-size="sm"
                        onClick={() => { void deleteRow(row); }}
                        title="Remover"
                      >
                        <span className="btn__icon">
                          <Trash2 className="neo-icon neo-icon--sm" aria-hidden="true" />
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--sm neo-text--sm neo-text--muted">
          <span>
            Página {page + 1} de {totalPages}
          </span>
          <div className="neo-inline neo-inline--sm">
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0 || loading}
            >
              Anterior
            </button>
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Seguinte
            </button>
          </div>
        </div>
      </section>

      {undoRef.current && (
        <div className="neo-panel neo-panel--compact" role="status">
          <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--sm">
            <span className="neo-text--sm neo-text--semibold text-fg">Notificação removida. Desejas desfazer?</span>
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
