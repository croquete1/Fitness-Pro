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
import NotificationsClient from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sessionUser = await getSessionUserSafe();
  const id = sessionUser?.user?.id;
  if (!id) redirect('/login');

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getNotificationsDashboardFallback();
    return <NotificationsClient {...fallback} />;
  }

  const now = new Date();
  const rangeStart = new Date(now.getTime() - 30 * 86_400_000);

  try {
    const [initial, windowed, unread] = await Promise.all([
      sb
        .from('notifications')
        .select('id,title,body,href,read,type,created_at', { count: 'exact' })
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(40),
      sb
        .from('notifications')
        .select('id,read,type,created_at')
        .eq('user_id', id)
        .gte('created_at', rangeStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(720),
      sb
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('read', false),
    ]);

    if (initial.error || windowed.error || unread.error) {
      console.error('[notifications:page] erro a carregar métricas', {
        initial: initial.error,
        windowed: windowed.error,
        unread: unread.error,
      });
      const fallback = getNotificationsDashboardFallback();
      return <NotificationsClient {...fallback} />;
    }

    const initialRows: NotificationRow[] = (initial.data ?? []).map((n: any) => ({
      id: n.id,
      title: n.title ?? null,
      body: n.body ?? null,
      href: n.href ?? null,
      read: !!n.read,
      type: describeType(n.type ?? null).key,
      created_at: n.created_at ?? null,
    }));

    const snapshots: NotificationSnapshot[] = (windowed.data ?? []).map((n: any) => ({
      read: !!n.read,
      type: n.type ?? null,
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
