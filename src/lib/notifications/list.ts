import type { NotificationRow } from '@/lib/notifications/types';

export type NotificationsListCounts = {
  all: number;
  unread: number;
  read: number;
};

export type NotificationsListResponse = {
  items?: NotificationRow[];
  total?: number;
  counts?: Partial<NotificationsListCounts> | null;
  source?: 'supabase' | 'fallback' | null;
  generatedAt?: string | null;
};

export type NormalizedNotificationsList = {
  items: NotificationRow[];
  total: number;
  counts: NotificationsListCounts;
  source: 'supabase' | 'fallback';
  generatedAt: string | null;
};

export function normalizeNotificationsListResponse(
  payload?: NotificationsListResponse | null,
): NormalizedNotificationsList {
  const items = Array.isArray(payload?.items) ? payload!.items : [];
  const fallbackUnread = items.filter((item) => !item.read).length;
  const fallbackRead = items.length - fallbackUnread;
  const total = typeof payload?.total === 'number' ? payload.total : items.length;
  const counts = payload?.counts ?? {};

  return {
    items,
    total,
    counts: {
      all: typeof counts?.all === 'number' ? counts.all : total,
      unread: typeof counts?.unread === 'number' ? counts.unread : fallbackUnread,
      read: typeof counts?.read === 'number' ? counts.read : fallbackRead,
    },
    source: payload?.source === 'supabase' ? 'supabase' : 'fallback',
    generatedAt: typeof payload?.generatedAt === 'string' ? payload.generatedAt : null,
  };
}
