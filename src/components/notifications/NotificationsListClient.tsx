'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowUpRight, CheckCheck, MailOpen, MailX } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
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

type StatusSegment = {
  value: StatusFilter;
  label: string;
  icon: React.ReactNode;
};

type NotificationsKey = ['notifications:list', string, StatusFilter, TypeFilter, number, number];

const STATUS_SEGMENTS: StatusSegment[] = [
  { value: 'all', label: 'Todas', icon: <CheckCheck size={16} aria-hidden /> },
  { value: 'unread', label: 'Por ler', icon: <MailX size={16} aria-hidden /> },
  { value: 'read', label: 'Lidas', icon: <MailOpen size={16} aria-hidden /> },
];

const formatter = new Intl.DateTimeFormat('pt-PT', {
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
  return formatter.format(date);
}

function getTotalForStatus(counts: { all: number; unread: number; read: number }, status: StatusFilter): number {
  switch (status) {
    case 'unread':
      return counts.unread;
    case 'read':
      return counts.read;
    default:
      return counts.all;
  }
}

export default function NotificationsListClient() {
  const { data: session } = useSession();
  const [status, setStatus] = React.useState<StatusFilter>('unread');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const [page, setPage] = React.useState(0);
  const pageSize = 10;
  const initialPayload = React.useMemo<NormalizedNotificationsList>(
    () => normalizeNotificationsListResponse(),
    [],
  );

  const viewerId = React.useMemo(() => {
    const candidate =
      session?.user && 'id' in session.user && typeof (session.user as { id?: unknown }).id === 'string'
        ? ((session.user as { id?: string }).id as string)
        : null;
    return candidate;
  }, [session?.user]);

  const notificationsKey = React.useMemo<NotificationsKey>(
    () => ['notifications:list', viewerId ?? 'anonymous', status, typeFilter, page, pageSize],
    [viewerId, status, typeFilter, page, pageSize],
  );

  const notificationsFetcher = React.useCallback(
    async ([, , nextStatus, nextType, nextPage, nextPageSize]: NotificationsKey) => {
      const params = new URLSearchParams();
      params.set('status', nextStatus);
      if (nextType && nextType !== 'all') {
        params.set('type', nextType);
      }
      params.set('page', String(nextPage));
      params.set('pageSize', String(nextPageSize));
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
    channel: `notifications-list-${viewerId ?? 'anonymous'}`,
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
  }, [status, typeFilter]);

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
      console.error('[notifications:list] falha a marcar tudo como lido', err);
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
      console.error('[notifications:list] falha a actualizar estado', err);
    }
  }, [refreshNotifications]);

  return (
    <section className="neo-panel notifications-list" aria-live="polite">
      <header className="notifications-list__header">
        <div className="notifications-list__intro">
          <div className="neo-stack neo-stack--xs">
            <h2 className="notifications-list__title">Centro de notificações</h2>
            <p className="notifications-list__subtitle">
              {totalForStatus > 0
                ? `${totalForStatus} notificações ${
                    status === 'unread' ? 'por ler' : status === 'read' ? 'lidas' : 'no filtro seleccionado'
                  }${typeFilter !== 'all' && activeTypeLabel ? ` · ${activeTypeLabel}` : ''}`
                : 'Sem notificações no filtro actual.'}
            </p>
          </div>
        </div>
        <div className="notifications-list__meta">
          <DataSourceBadge source={source} generatedAt={generatedAt} />
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            disabled={loading || counts.unread === 0}
            title="Marcar todas as notificações como lidas"
          >
            Marcar tudo como lido
          </Button>
        </div>
      </header>

      <div className="neo-segmented notifications-list__tabs" role="tablist" aria-label="Filtrar notificações por estado">
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
            <span className="notifications-list__tabIcon" aria-hidden>
              {segment.icon}
            </span>
            <span className="notifications-list__tabLabel">{segment.label}</span>
            <span className="neo-segmented__count">{getTotalForStatus(counts, segment.value)}</span>
          </button>
        ))}
      </div>
      {payload.types.length > 0 ? (
        <div className="notifications-list__types" role="group" aria-label="Filtrar por tipo de notificação">
          <button
            type="button"
            className="notifications-list__type"
            data-active={typeFilter === 'all'}
            aria-pressed={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          >
            <span className="notifications-list__typeLabel">Todos</span>
            <span className="notifications-list__typeCount">{numberFormatter.format(totalAcrossTypes)}</span>
          </button>
          {payload.types.map((type) => (
            <button
              key={type.key}
              type="button"
              className="notifications-list__type"
              data-active={typeFilter === type.key}
              aria-pressed={typeFilter === type.key}
              onClick={() => setTypeFilter(type.key)}
            >
              <span className="notifications-list__typeLabel">{type.label}</span>
              <span className="notifications-list__typeCount">{numberFormatter.format(type.count)}</span>
            </button>
          ))}
        </div>
      ) : null}

      {errorMessage && !loading ? (
        <Alert tone="warning" title="Falha ao sincronizar notificações" role="alert">
          {errorMessage}
        </Alert>
      ) : null}

      {loading ? (
        <div className="notifications-list__loading" role="status" aria-live="assertive">
          <Spinner size={24} />
          <span className="neo-text--sm neo-text--muted">A sincronizar notificações…</span>
        </div>
      ) : (
        <div className="notifications-list__items" role="list">
          {items.map((item) => (
            <article key={item.id} className="notifications-list__item" data-read={item.read} role="listitem">
              <div className="notifications-list__itemHeader">
                <div className="notifications-list__itemMeta">
                  <span className="notifications-list__itemTitle">{item.title ?? 'Notificação'}</span>
                  <time className="notifications-list__itemDate" dateTime={item.created_at ?? undefined}>
                    {formatDate(item.created_at)}
                  </time>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRead(item)}
                  title={item.read ? 'Marcar como não lida' : 'Marcar como lida'}
                >
                  {item.read ? 'Marcar como não lida' : 'Marcar como lida'}
                </Button>
              </div>
              {item.body ? <p className="notifications-list__itemBody">{item.body}</p> : null}
              <footer className="notifications-list__itemFooter">
                {item.href ? (
                  <Link className="notifications-list__itemLink" href={item.href}>
                    Abrir detalhe
                    <ArrowUpRight size={14} aria-hidden />
                  </Link>
                ) : (
                  <span className="notifications-list__itemLink" data-disabled>
                    Sem ligação directa
                  </span>
                )}
              </footer>
            </article>
          ))}
          {!items.length && !errorMessage ? (
            <div className="notifications-list__empty" role="status">
              <span className="neo-text--sm neo-text--muted">Sem notificações para este filtro.</span>
            </div>
          ) : null}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="notifications-list__pagination" aria-label="Paginação de notificações">
          <button
            type="button"
            className="neo-button neo-button--ghost neo-button--small"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={loading || page === 0}
          >
            Anterior
          </button>
          <span className="notifications-list__paginationStatus">
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
