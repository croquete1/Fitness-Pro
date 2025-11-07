import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getNotificationsListFallback } from '@/lib/fallback/notifications';
import { describeType } from '@/lib/notifications/dashboard';
import { extractNotificationMetadata } from '@/lib/notifications/metadata';
import type { NotificationRow } from '@/lib/notifications/types';
import { buildRateLimitHeaders, rateLimitRequest } from '@/lib/http/rateLimit';

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

  let includeMetadata = true;
  let includeType = true;

  const applyFilters = (query: any, options: { includeTypeFilter?: boolean } = {}) => {
    const useTypeFilter = options.includeTypeFilter ?? includeType;
    let next = query.eq('user_id', uid);
    if (useTypeFilter && typeFilter && typeFilter !== 'all') {
      next = next.eq('type', typeFilter);
    }
    if (escapedSearch) {
      const like = `%${escapedSearch}%`;
      next = next.or(`title.ilike.${like},body.ilike.${like}`);
    }
    return next;
  };

  const buildListQuery = () => {
    const select = buildSelect([
      'id',
      'title',
      'body',
      'href',
      includeMetadata ? 'metadata' : null,
      'read',
      includeType ? 'type' : null,
      'created_at',
    ]);

    let query = applyFilters(
      sb
        .from('notifications')
        .select(select, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to),
      { includeTypeFilter: includeType },
    );

    if (status === 'unread') query = query.eq('read', false);
    if (status === 'read') query = query.eq('read', true);
    return query;
  };

  let listResult = await buildListQuery();

  if (isMissingColumnError(listResult.error, 'metadata')) {
    includeMetadata = false;
    listResult = await buildListQuery();
  }

  if (isMissingColumnError(listResult.error, 'type')) {
    includeType = false;
    listResult = await buildListQuery();
  }

  const { data, count, error } = listResult;
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

  const items: NotificationRow[] = (data ?? []).map((n: any) => {
    const meta = includeMetadata ? extractNotificationMetadata(n?.metadata ?? null) : { href: null, type: null };
    const hrefCandidate = [n?.href, meta.href]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .find((value) => value.length > 0);

    const typeSource = includeType ? (meta.type ?? n?.type ?? null) : meta.type ?? null;
    const type = describeType((typeSource ?? null) as string | null);

    return {
      id: n.id as string,
      title: (n.title ?? null) as string | null,
      body: (n.body ?? null) as string | null,
      href: (hrefCandidate && hrefCandidate.length > 0 ? hrefCandidate : null) as string | null,
      read: !!n.read,
      type: type.key,
      created_at: (n.created_at ?? null) as string | null,
    };
  });

  const baseCountQuery = () =>
    applyFilters(
      sb
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .order('created_at', { ascending: false }),
      { includeTypeFilter: includeType },
    );

  const typeSummaryPromise = includeType
    ? (async () => {
        let summary = applyFilters(
          sb
            .from('notifications')
            .select('type, count:id', { head: false }),
          { includeTypeFilter: true },
        ) as any;
        summary = summary.group('type').order('count', { ascending: false }).order('type', { ascending: true });
        if (status === 'unread') {
          summary = summary.eq('read', false);
        }
        if (status === 'read') {
          summary = summary.eq('read', true);
        }
        return summary;
      })()
    : Promise.resolve({ data: [], error: null } as { data: any; error: null });

  const [allCount, unreadCount, readCount, typeRows] = await Promise.all([
    baseCountQuery(),
    baseCountQuery().eq('read', false),
    baseCountQuery().eq('read', true),
    typeSummaryPromise,
  ]);

  let filteredItems = items;
  let effectiveTotal = count ?? items.length;

  if (!includeType && typeFilter && typeFilter !== 'all') {
    filteredItems = items.filter((item) => describeType(item.type ?? null).key === typeFilter);
    effectiveTotal = filteredItems.length;
  }

  const buildTypesFromItems = () => {
    const fallbackMap = new Map<string, { key: string; label: string; count: number }>();
    filteredItems.forEach((item) => {
      const meta = describeType(item.type ?? null);
      const current = fallbackMap.get(meta.key) ?? { key: meta.key, label: meta.label, count: 0 };
      current.count += 1;
      fallbackMap.set(meta.key, current);
    });
    return Array.from(fallbackMap.values());
  };

  if (typeRows.error) {
    console.error('[notifications:list] erro a calcular tipos', typeRows.error);
  }

  const supabaseTypes = includeType && Array.isArray(typeRows.data) ? typeRows.data : [];
  const typesSource =
    supabaseTypes.length > 0
      ? supabaseTypes.map((row: any) => {
          const meta = describeType(row.type ?? null);
          const count = Number(row.count ?? 0);
          return {
            key: meta.key,
            label: meta.label,
            count: Number.isFinite(count) && count >= 0 ? count : 0,
          };
        })
      : buildTypesFromItems();

  const types = typesSource.sort((a, b) => {
    if (b.count === a.count) return a.label.localeCompare(b.label, 'pt-PT');
    return b.count - a.count;
  });

  const countsFallback = (() => {
    const unreadItems = filteredItems.filter((item) => !item.read).length;
    return {
      all: filteredItems.length,
      unread: unreadItems,
      read: filteredItems.length - unreadItems,
    };
  })();

  const countsSource =
    !includeType && typeFilter && typeFilter !== 'all'
      ? countsFallback
      : {
          all: allCount.count ?? filteredItems.length,
          unread: unreadCount.count ?? 0,
          read: readCount.count ?? 0,
        };

  return NextResponse.json(
    {
      items: filteredItems,
      total: effectiveTotal,
      counts: countsSource,
      source: 'supabase',
      generatedAt: new Date().toISOString(),
      types,
    },
    { headers },
  );
}
