import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getNotificationsListFallback } from '@/lib/fallback/notifications';
import { describeType } from '@/lib/notifications/dashboard';
import type { NotificationRow } from '@/lib/notifications/types';

export async function GET(req: Request) {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ items: [], total: 0 });

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'all') as 'all' | 'unread' | 'read';
  const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
  const typeFilter = searchParams.get('type');
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const querySearch = searchParams.get('q');

  const sb = tryCreateServerClient();
  const buildFallback = () =>
    getNotificationsListFallback({
      status,
      type: typeFilter,
      search: querySearch,
      page,
      pageSize,
    });

  if (!sb) {
    const fallback = buildFallback();
    return NextResponse.json({
      ...fallback,
      source: 'fallback',
    });
  }

  const escapedSearch = querySearch
    ? querySearch
        .trim()
        .replace(/[%_]/g, (match) => `\\${match}`)
    : '';

  const applyFilters = (query: any) => {
    let next = query.eq('user_id', uid);
    if (typeFilter && typeFilter !== 'all') {
      next = next.eq('type', typeFilter);
    }
    if (escapedSearch) {
      const like = `%${escapedSearch}%`;
      next = next.or(`title.ilike.${like},body.ilike.${like}`);
    }
    return next;
  };

  let q = applyFilters(
    sb
      .from('notifications')
      .select('id,title,body,href,read,type,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to),
  );

  if (status === 'unread') q = q.eq('read', false);
  if (status === 'read') q = q.eq('read', true);

  const { data, count, error } = await q;
  if (error) {
    console.error('[notifications:list] erro a carregar notificações', error);
    const fallback = buildFallback();
    return NextResponse.json({
      ...fallback,
      source: 'fallback',
    });
  }

  const items: NotificationRow[] = (data ?? []).map((n: any) => ({
    id: n.id as string,
    title: (n.title ?? null) as string | null,
    body: (n.body ?? null) as string | null,
    href: (n.href ?? null) as string | null,
    read: !!n.read,
    type: describeType(n.type ?? null).key,
    created_at: (n.created_at ?? null) as string | null,
  }));

  const baseCountQuery = () => applyFilters(
    sb
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .order('created_at', { ascending: false }),
  );

  const [allCount, unreadCount, readCount] = await Promise.all([
    baseCountQuery(),
    baseCountQuery().eq('read', false),
    baseCountQuery().eq('read', true),
  ]);

  return NextResponse.json({
    items,
    total: count ?? 0,
    counts: {
      all: allCount.count ?? items.length,
      unread: unreadCount.count ?? 0,
      read: readCount.count ?? 0,
    },
    source: 'supabase',
    generatedAt: new Date().toISOString(),
  });
}
