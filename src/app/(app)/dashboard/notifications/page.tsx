import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildNotificationDashboardMetrics, describeType } from '@/lib/notifications/dashboard';
import type {
  NotificationDashboardData,
  NotificationRow,
  NotificationSnapshot,
} from '@/lib/notifications/types';
import { getNotificationsDashboardFallback } from '@/lib/fallback/notifications';
import { extractNotificationMetadata } from '@/lib/notifications/metadata';
import { toAppRole } from '@/lib/roles';
import NotificationsClient from './NotificationsClient';

export const dynamic = 'force-dynamic';

type QueryOptions = {
  includeMetadata: boolean;
  includeType: boolean;
};

function buildSelect(columns: Array<string | null | false | undefined>) {
  return columns.filter(Boolean).join(',');
}

function isMissingColumnError(error: unknown, column?: string) {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string | null; message?: string | null };
  if (err.code === '42703') {
    if (!column) return true;
    return err.message ? err.message.includes(column) : true;
  }
  if (typeof err.message === 'string') {
    return /column .* does not exist/i.test(err.message);
  }
  return false;
}

async function fetchNotificationsDataset(
  sb: ReturnType<typeof tryCreateServerClient>,
  userId: string,
  rangeStart: Date,
  options: QueryOptions,
) {
  const baseSelect = buildSelect([
    'id',
    'title',
    'body',
    'href',
    options.includeMetadata ? 'metadata' : null,
    'read',
    options.includeType ? 'type' : null,
    'created_at',
  ]);

  const initial = await sb
    .from('notifications')
    .select(baseSelect, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40);

  const windowedSelect = buildSelect([
    'id',
    'read',
    options.includeType ? 'type' : null,
    'created_at',
  ]);

  const windowed = await sb
    .from('notifications')
    .select(windowedSelect)
    .eq('user_id', userId)
    .gte('created_at', rangeStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(720);

  const unread = await sb
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  return { initial, windowed, unread };
}

export default async function Page() {
  const sessionUser = await getSessionUserSafe();
  const id = sessionUser?.user?.id;
  if (!id) redirect('/login');

  const role = toAppRole(sessionUser?.user?.role) ?? 'CLIENT';
  if (role === 'CLIENT') {
    redirect('/dashboard/clients');
  }

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getNotificationsDashboardFallback();
    return <NotificationsClient {...fallback} />;
  }

  const now = new Date();
  const rangeStart = new Date(now.getTime() - 30 * 86_400_000);

  try {
    let options: QueryOptions = { includeMetadata: true, includeType: true };
    let { initial, windowed, unread } = await fetchNotificationsDataset(sb, id, rangeStart, options);

    if (
      isMissingColumnError(initial.error, 'metadata') ||
      isMissingColumnError(windowed.error, 'metadata')
    ) {
      options = { ...options, includeMetadata: false };
      ({ initial, windowed, unread } = await fetchNotificationsDataset(sb, id, rangeStart, options));
    }

    if (isMissingColumnError(initial.error, 'type') || isMissingColumnError(windowed.error, 'type')) {
      options = { ...options, includeType: false };
      ({ initial, windowed, unread } = await fetchNotificationsDataset(sb, id, rangeStart, options));
    }

    if (initial.error || windowed.error || unread.error) {
      console.error('[notifications:page] erro a carregar métricas', {
        initial: initial.error,
        windowed: windowed.error,
        unread: unread.error,
      });
      const fallback = getNotificationsDashboardFallback();
      return <NotificationsClient {...fallback} />;
    }

    const initialRows: NotificationRow[] = (initial.data ?? []).map((n: any) => {
      const meta = options.includeMetadata ? extractNotificationMetadata(n?.metadata ?? null) : { href: null, type: null };
      const hrefCandidate = [n?.href, meta.href]
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .find((value) => value.length > 0);

      const typeSource = options.includeType ? (meta.type ?? n?.type ?? null) : meta.type ?? null;
      const type = describeType(typeSource as string | null);

      return {
        id: n.id,
        title: n.title ?? null,
        body: n.body ?? null,
        href: hrefCandidate && hrefCandidate.length > 0 ? hrefCandidate : null,
        read: !!n.read,
        type: type.key,
        created_at: n.created_at ?? null,
      };
    });

    const snapshots: NotificationSnapshot[] = (windowed.data ?? []).map((n: any) => ({
      read: !!n.read,
      type: options.includeType ? (n.type ?? null) : null,
      created_at: n.created_at ?? null,
    }));

    const total = initial.count ?? initialRows.length;
    const unreadTotal = unread.count ?? initialRows.filter((row) => !row.read).length;
    const metrics = buildNotificationDashboardMetrics(snapshots, {
      total,
      unread: unreadTotal,
      lastDeliveryAt: initialRows[0]?.created_at ?? null,
      supabase: true,
      now,
    });

    const payload: NotificationDashboardData = {
      initialRows,
      initialTotal: total,
      metrics,
    };

    return <NotificationsClient {...payload} />;
  } catch (error) {
    console.error('[notifications:page] falhou a carregar dashboard', error);
    const fallback = getNotificationsDashboardFallback();
    return <NotificationsClient {...fallback} />;
  }
}
