import { describeType } from '@/lib/notifications/dashboard';
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
  types?: Array<{ key?: string | null; label?: string | null; count?: number | null }> | null;
};

export type NormalizedNotificationsList = {
  items: NotificationRow[];
  total: number;
  counts: NotificationsListCounts;
  source: 'supabase' | 'fallback';
  generatedAt: string | null;
  types: Array<{ key: string; label: string; count: number }>;
};

export function normalizeNotificationsListResponse(
  payload?: NotificationsListResponse | null,
): NormalizedNotificationsList {
  const items = Array.isArray(payload?.items) ? payload!.items : [];
  const fallbackUnread = items.filter((item) => !item.read).length;
  const fallbackRead = items.length - fallbackUnread;
  const total = typeof payload?.total === 'number' ? payload.total : items.length;
  const counts = payload?.counts ?? {};
  const fallbackTypesMap = new Map<string, { key: string; label: string; count: number }>();
  items.forEach((item) => {
    const meta = describeType(item.type ?? null);
    const current = fallbackTypesMap.get(meta.key) ?? { key: meta.key, label: meta.label, count: 0 };
    current.count += 1;
    fallbackTypesMap.set(meta.key, current);
  });

  const normalizedTypes = Array.isArray(payload?.types)
    ? payload!.types
        .map((entry) => {
          if (!entry) return null;
          const meta = describeType(entry.key ?? null);
          const count = typeof entry.count === 'number' ? entry.count : 0;
          const label = typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : meta.label;
          return {
            key: meta.key,
            label,
            count: Math.max(0, count),
          };
        })
        .filter((entry): entry is { key: string; label: string; count: number } => Boolean(entry))
    : Array.from(fallbackTypesMap.values());

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
    types: normalizedTypes.sort((a, b) => {
      if (b.count === a.count) return a.label.localeCompare(b.label, 'pt-PT');
      return b.count - a.count;
    }),
  };
}
