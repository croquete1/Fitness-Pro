import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getNotificationsListFallback } from '@/lib/fallback/notifications';
import { describeType } from '@/lib/notifications/dashboard';
import type { NotificationRow } from '@/lib/notifications/types';
import { buildRateLimitHeaders, rateLimitRequest } from '@/lib/http/rateLimit';

export async function GET(req: Request) {
  const rate = rateLimitRequest(req, { limit: 90, windowMs: 60_000, prefix: 'notifications:list' });
  const baseHeaders = buildRateLimitHeaders(rate);
  const headers = { ...baseHeaders, 'cache-control': 'no-store' } as Record<string, string>;
  if (!rate.ok) {
    return NextResponse.json(
      { items: [], total: 0, message: 'Demasiados pedidos. Aguarda um pouco antes de tentar de novo.' },
      { status: 429, headers },
    );
  }

  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ items: [], total: 0 }, { headers });

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
    return NextResponse.json(
      {
        ...fallback,
        source: 'fallback',
      },
      { headers },
    );
  }

  const escapedSearch = querySearch
    ? querySearch
        .trim()
        .replace(/[%_]/g, (match) => `\\${match}`)
    : '';

  const applyFilters = (query: any, options: { includeType?: boolean } = {}) => {
    let next = query.eq('user_id', uid);
    if (options.includeType !== false && typeFilter && typeFilter !== 'all') {
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
    return NextResponse.json(
      {
        ...fallback,
        source: 'fallback',
      },
      { headers },
    );
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

  const baseCountQuery = () =>
    applyFilters(
      sb
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .order('created_at', { ascending: false }),
    );

  const typeSummaryQuery = () =>
    applyFilters(
      sb
        .from('notifications')
        .select('type, count:id', { head: false })
        .order('count', { ascending: false })
        .order('type', { ascending: true }),
      { includeType: false },
    );

  const [allCount, unreadCount, readCount, typeRows] = await Promise.all([
    baseCountQuery(),
    baseCountQuery().eq('read', false),
    baseCountQuery().eq('read', true),
    typeSummaryQuery(),
  ]);

  if (typeRows.error) {
    console.error('[notifications:list] erro a calcular tipos', typeRows.error);
  }

  const types = (typeRows.data ?? []).map((row: any) => {
    const meta = describeType(row.type ?? null);
    const count = Number(row.count ?? 0);
    return {
      key: meta.key,
      label: meta.label,
      count: Number.isFinite(count) && count >= 0 ? count : 0,
    };
  });

  return NextResponse.json(
    {
      items,
      total: count ?? 0,
      counts: {
        all: allCount.count ?? items.length,
        unread: unreadCount.count ?? 0,
        read: readCount.count ?? 0,
      },
      source: 'supabase',
      generatedAt: new Date().toISOString(),
      types,
    },
    { headers },
  );
}
