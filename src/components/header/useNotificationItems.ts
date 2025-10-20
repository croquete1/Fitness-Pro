'use client';

import * as React from 'react';
import { buildFallbackHeaderNotifications } from '@/lib/fallback/header-notifications';
import { useHeaderCounts } from './HeaderCountsContext';

type NotificationSource = 'supabase' | 'fallback';

export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  createdAt: string | null;
  read: boolean;
};

type Options = {
  limit?: number;
};

type Result = {
  items: NotificationItem[];
  unreadCount: number;
  source: NotificationSource;
  syncedAt: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setItems: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
};

function normaliseItems(payload: any, limit: number): NotificationItem[] {
  if (!payload) return [];

  const rawItems: any[] = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.notifications)
      ? payload.notifications
      : [];

  return rawItems.slice(0, limit).map((item: any, index: number) => ({
    id: String(item?.id ?? `notification-${index}`),
    title: String(item?.title ?? item?.name ?? 'Notificação'),
    body: item?.body ?? item?.description ?? null,
    href: typeof item?.href === 'string' ? item.href : typeof item?.url === 'string' ? item.url : null,
    createdAt: typeof item?.created_at === 'string' ? item.created_at : item?.createdAt ?? null,
    read: Boolean(item?.read ?? item?.is_read ?? false),
  }));
}

export function useNotificationItems({ limit = 8 }: Options = {}): Result {
  const headerCounts = useHeaderCounts();
  const fallbackSnapshot = React.useMemo(() => buildFallbackHeaderNotifications({ limit }), [limit]);

  const [items, setItems] = React.useState<NotificationItem[]>(fallbackSnapshot.items);
  const [source, setSource] = React.useState<NotificationSource>('fallback');
  const [syncedAt, setSyncedAt] = React.useState<string | null>(fallbackSnapshot.generatedAt ?? null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/notifications/dropdown?limit=${limit}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error((await response.text()) || 'Não foi possível carregar notificações.');
      }
      const json = await response.json().catch(() => ({}));
      const normalised = normaliseItems(json, limit);
      setItems(normalised);
      const src: NotificationSource = json?.source === 'fallback' ? 'fallback' : 'supabase';
      setSource(src);
      const generatedAt = json?.generatedAt ?? json?.generated_at ?? new Date().toISOString();
      setSyncedAt(typeof generatedAt === 'string' ? generatedAt : new Date().toISOString());
      const unread = normalised.filter((item) => !item.read).length;
      headerCounts.setCounts({ notificationsCount: unread });
    } catch (err: any) {
      console.warn('[header] notifications dropdown failed', err);
      setItems(fallbackSnapshot.items);
      setSource('fallback');
      setSyncedAt(fallbackSnapshot.generatedAt ?? new Date().toISOString());
      setError('Sem ligação ao Supabase — a mostrar dados determinísticos.');
      headerCounts.setCounts({ notificationsCount: fallbackSnapshot.unreadCount });
    } finally {
      setLoading(false);
    }
  }, [headerCounts, limit, fallbackSnapshot]);

  const unreadCount = React.useMemo(() => items.filter((item) => !item.read).length, [items]);

  return {
    items,
    unreadCount,
    source,
    syncedAt,
    loading,
    error,
    refresh,
    setItems,
  };
}
