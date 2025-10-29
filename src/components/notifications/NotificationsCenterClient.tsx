'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowUpRight, CheckCheck, MailOpen, MailX, RefreshCcw, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import type { NotificationRow } from '@/lib/notifications/types';
import {
  normalizeNotificationsListResponse,
  type NormalizedNotificationsList,
  type NotificationsListResponse,
} from '@/lib/notifications/list';
import { useRealtimeResource } from '@/lib/supabase/useRealtimeResource';

type StatusFilter = 'all' | 'unread' | 'read';

type TypeFilter = 'all' | string;

type NotificationsCenterClientProps = {
  initialItems?: NotificationRow[];
  initialTotal?: number;
  initialCounts?: { all: number; unread: number; read: number };
  initialSource?: 'supabase' | 'fallback';
  initialGeneratedAt?: string | null;
  viewerId?: string | null;
};

type StatusSegment = {
  value: StatusFilter;
  label: string;
  icon: React.ReactNode;
};

type NotificationsKey = ['notifications:center', string, StatusFilter, TypeFilter, number, number, string];

const STATUS_SEGMENTS: StatusSegment[] = [
  { value: 'all', label: 'Todas', icon: <CheckCheck size={16} aria-hidden /> },
  { value: 'unread', label: 'Por ler', icon: <MailX size={16} aria-hidden /> },
  { value: 'read', label: 'Lidas', icon: <MailOpen size={16} aria-hidden /> },
];

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

function countForStatus(counts: { all: number; unread: number; read: number }, status: StatusFilter): number {
  switch (status) {
    case 'unread':
      return counts.unread;
    case 'read':
      return counts.read;
    default:
      return counts.all;
  }
}

export default function NotificationsCenterClient({
  initialItems = [],
  initialTotal = 0,
  initialCounts,
  initialSource = 'fallback',
  initialGeneratedAt = null,
  viewerId: providedViewerId = null,
}: NotificationsCenterClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = React.useState<StatusFilter>('unread');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const [page, setPage] = React.useState(0);
  const pageSize = 12;
  const [query, setQuery] = React.useState('');
  const deferredQuery = React.useDeferredValue(query);
  const normalizedQuery = React.useMemo(() => deferredQuery.trim(), [deferredQuery]);
  const initialPayload = React.useMemo<NormalizedNotificationsList>(
    () =>
      normalizeNotificationsListResponse({
        items: initialItems,
        total: initialTotal,
        counts: initialCounts ?? undefined,
        source: initialSource,
        generatedAt: initialGeneratedAt,
      }),
    [initialCounts, initialGeneratedAt, initialItems, initialSource, initialTotal],
  );

  const viewerId = React.useMemo(() => {
    if (typeof providedViewerId === 'string' && providedViewerId.trim()) {
      return providedViewerId.trim();
    }
    const sessionId =
      session?.user && 'id' in session.user && typeof (session.user as { id?: unknown }).id === 'string'
        ? ((session.user as { id?: string }).id as string)
        : null;
    return sessionId;
  }, [providedViewerId, session?.user]);

  const notificationsKey = React.useMemo<NotificationsKey>(
    () => [
      'notifications:center',
      viewerId ?? 'anonymous',
      status,
      typeFilter,
      page,
      pageSize,
      normalizedQuery,
    ],
    [viewerId, status, typeFilter, page, pageSize, normalizedQuery],
  );

  const notificationsFetcher = React.useCallback(
    async ([, , nextStatus, nextType, nextPage, nextPageSize, search]: NotificationsKey) => {
      const params = new URLSearchParams();
      params.set('status', nextStatus);
      if (nextType && nextType !== 'all') {
        params.set('type', nextType);
      }
      params.set('page', String(nextPage));
      params.set('pageSize', String(nextPageSize));
      if (search) {
        params.set('q', search);
      }
      const response = await fetch(`/api/notifications/list?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Falha ao carregar notificações (${response.status}).`);
      }
      const payload = (await response.json()) as NotificationsListResponse;
      return normalizeNotificationsListResponse(payload);
    },
    [],
  );

  const notificationSubscriptions = React.useMemo(
    () => (viewerId ? [{ table: 'notifications', filter: `user_id=eq.${viewerId}` }] : []),
    [viewerId],
  );

  const { data, error, isLoading, isValidating, refresh: refreshNotifications } = useRealtimeResource<
    NormalizedNotificationsList,
    NotificationsKey
  >({
    key: notificationsKey,
    fetcher: notificationsFetcher,
    initialData: initialPayload,
    channel: `notifications-center-${viewerId ?? 'anonymous'}`,
    subscriptions: notificationSubscriptions,
    realtimeEnabled: Boolean(viewerId),
  });

  const payload = data ?? initialPayload;
  const items = payload.items;
  const counts = payload.counts;
  const source = payload.source;
  const generatedAt = payload.generatedAt;
  const errorMessage = error?.message ?? null;
  const loading = (isLoading || isValidating) && !errorMessage;
  const totalForStatus = payload.total;
  const totalAcrossTypes = React.useMemo(
    () => payload.types.reduce((acc, type) => acc + type.count, 0),
    [payload.types],
  );
  const activeTypeLabel = React.useMemo(
    () => (typeFilter === 'all' ? null : payload.types.find((type) => type.key === typeFilter)?.label ?? null),
    [payload.types, typeFilter],
  );

  React.useEffect(() => {
    setPage(0);
  }, [status, typeFilter, deferredQuery]);

  const totalPages = Math.max(1, Math.ceil(totalForStatus / pageSize));

  React.useEffect(() => {
    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  React.useEffect(() => {
    if (typeFilter === 'all') return;
    const stillAvailable = payload.types.some((type) => type.key === typeFilter);
    if (!stillAvailable) {
      setTypeFilter('all');
    }
  }, [payload.types, typeFilter]);

  const markAllRead = React.useCallback(async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setStatus('unread');
      setPage(0);
      await refreshNotifications();
    } catch (err) {
      console.error('[notifications:center] falha a marcar tudo como lido', err);
    }
  }, [refreshNotifications]);

  const toggleRead = React.useCallback(async (row: NotificationRow) => {
    try {
      await fetch(`/api/notifications/${row.read ? 'mark-unread' : 'mark-read'}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: [row.id] }),
      });
      await refreshNotifications();
    } catch (err) {
      console.error('[notifications:center] falha a actualizar estado', err);
    }
  }, [refreshNotifications]);

  const refresh = React.useCallback(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  return (
    <section className="notifications-center neo-panel neo-stack neo-stack--xl" aria-live="polite">
      <header className="notifications-center__header">
        <div className="notifications-center__heading">
          <div className="neo-stack neo-stack--xs">
            <h2 className="notifications-center__title">Centro de notificações</h2>
            <p className="notifications-center__subtitle">
              {totalForStatus > 0
                ? `${numberFormatter.format(totalForStatus)} notificações ${
                    status === 'unread' ? 'por ler' : status === 'read' ? 'lidas' : 'no filtro seleccionado'
                  }${typeFilter !== 'all' && activeTypeLabel ? ` · ${activeTypeLabel}` : ''}`
                : 'Sem notificações para o filtro actual.'}
            </p>
          </div>
        </div>
        <div className="notifications-center__meta">
          <DataSourceBadge source={source} generatedAt={generatedAt} />
          <div className="notifications-center__metaActions">
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              title="Actualizar notificações"
              leftIcon={<RefreshCcw size={14} aria-hidden />}
              disabled={loading}
            >
              Refrescar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              title="Marcar todas as notificações como lidas"
              disabled={loading || counts.unread === 0}
            >
              Marcar tudo como lido
            </Button>
          </div>
        </div>
      </header>

      <section className="notifications-center__summary" aria-label="Resumo de notificações">
        <article className="notifications-center__metric" data-tone="primary">
          <span className="notifications-center__metricLabel">Total filtrado</span>
          <strong className="notifications-center__metricValue">{numberFormatter.format(totalForStatus)}</strong>
          <span className="notifications-center__metricHint">
            {status === 'all'
              ? 'Inclui todas as notificações no filtro actual'
              : status === 'unread'
                ? 'Apenas notificações por ler após aplicar filtros'
                : 'Apenas notificações lidas após aplicar filtros'}
          </span>
        </article>
        <article className="notifications-center__metric" data-tone={counts.unread > 0 ? 'warning' : 'success'}>
          <span className="notifications-center__metricLabel">Por ler</span>
          <strong className="notifications-center__metricValue">{numberFormatter.format(counts.unread)}</strong>
          <span className="notifications-center__metricHint">
            {counts.all > 0
              ? `${Math.round((counts.unread / Math.max(1, counts.all)) * 100)}% do total`
              : 'Sem notificações registadas'}
          </span>
        </article>
        <article className="notifications-center__metric" data-tone="info">
          <span className="notifications-center__metricLabel">Lidas</span>
          <strong className="notifications-center__metricValue">{numberFormatter.format(counts.read)}</strong>
          <span className="notifications-center__metricHint">Inclui histórico confirmado</span>
        </article>
      </section>

      <div className="notifications-center__controls">
        <div className="notifications-center__search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Procurar por título ou mensagem…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="notifications-center__searchInput"
            aria-label="Pesquisar notificações"
          />
        </div>
        <div className="neo-segmented notifications-center__tabs" role="tablist" aria-label="Filtrar notificações por estado">
          {STATUS_SEGMENTS.map((segment) => (
            <button
              key={segment.value}
              type="button"
              className="neo-segmented__btn"
              data-active={segment.value === status}
              onClick={() => setStatus(segment.value)}
              role="tab"
              aria-selected={segment.value === status}
            >
              <span className="notifications-center__tabIcon" aria-hidden>
                {segment.icon}
              </span>
              <span className="notifications-center__tabLabel">{segment.label}</span>
            <span className="neo-segmented__count">{countForStatus(counts, segment.value)}</span>
          </button>
        ))}
        </div>
        {payload.types.length > 0 ? (
          <div className="notifications-center__types" role="group" aria-label="Filtrar por tipo de notificação">
            <button
              type="button"
              className="notifications-center__type"
              data-active={typeFilter === 'all'}
              aria-pressed={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            >
              <span className="notifications-center__typeLabel">Todos</span>
              <span className="notifications-center__typeCount">{numberFormatter.format(totalAcrossTypes)}</span>
            </button>
            {payload.types.map((type) => (
              <button
                key={type.key}
                type="button"
                className="notifications-center__type"
                data-active={typeFilter === type.key}
                aria-pressed={typeFilter === type.key}
                onClick={() => setTypeFilter(type.key)}
              >
                <span className="notifications-center__typeLabel">{type.label}</span>
                <span className="notifications-center__typeCount">{numberFormatter.format(type.count)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {errorMessage && !loading ? (
        <Alert tone="warning" title="Falha ao sincronizar notificações" role="alert">
          {errorMessage}
        </Alert>
      ) : null}

      {loading ? (
        <div className="notifications-center__loading" role="status" aria-live="assertive">
          <Spinner size={24} />
          <span className="neo-text--sm neo-text--muted">A sincronizar notificações…</span>
        </div>
      ) : (
        <div className="notifications-center__list" role="list">
          {items.map((item) => (
            <article key={item.id} className="notifications-center__item" data-read={item.read} role="listitem">
              <div className="notifications-center__itemHeader">
                <div className="notifications-center__itemMeta">
                  <span className="notifications-center__itemTitle">{item.title ?? 'Notificação'}</span>
                  <time className="notifications-center__itemDate" dateTime={item.created_at ?? undefined}>
                    {formatDate(item.created_at)}
                  </time>
                </div>
                <div className="notifications-center__itemActions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRead(item)}
                    title={item.read ? 'Marcar como não lida' : 'Marcar como lida'}
                  >
                    {item.read ? 'Marcar como não lida' : 'Marcar como lida'}
                  </Button>
                  {item.href ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(item.href ?? '/dashboard/notifications')}
                      rightIcon={<ArrowUpRight size={14} aria-hidden />}
                    >
                      Abrir
                    </Button>
                  ) : null}
                </div>
              </div>
              {item.body ? <p className="notifications-center__itemBody">{item.body}</p> : null}
            </article>
          ))}
          {!items.length && !errorMessage ? (
            <div className="notifications-center__empty" role="status">
              <span className="neo-text--sm neo-text--muted">Sem notificações para este filtro.</span>
            </div>
          ) : null}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="notifications-center__pagination" aria-label="Paginação de notificações">
          <button
            type="button"
            className="neo-button neo-button--ghost neo-button--small"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={loading || page === 0}
          >
            Anterior
          </button>
          <span className="notifications-center__paginationStatus">
            Página {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            className="neo-button neo-button--ghost neo-button--small"
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={loading || page >= totalPages - 1}
          >
            Seguinte
          </button>
        </nav>
      ) : null}
    </section>
  );
}
