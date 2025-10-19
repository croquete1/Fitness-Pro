import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildSearchDashboard } from '@/lib/search/dashboard';
import { getSearchDashboardFallback } from '@/lib/fallback/search';
import {
  fetchSearchCollections,
  parseSearchOffset,
  parseSearchTypes,
} from '@/lib/search/server';
import type { SearchDashboardData, SearchResultType } from '@/lib/search/types';
import SearchClient from './search.client';

export const dynamic = 'force-dynamic';

type SearchDashboardResponse = SearchDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type PageProps = {
  searchParams?: Record<string, string | string[]> | null;
};

function getViewerName(session: Awaited<ReturnType<typeof getSessionUserSafe>>): string | null {
  const meta = (session?.user as { user_metadata?: { full_name?: string | null; name?: string | null } })?.user_metadata;
  return meta?.full_name ?? meta?.name ?? session?.user?.email ?? null;
}

function parseParam(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value[0] ?? '' : value;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    redirect(`/login?next=${encodeURIComponent('/dashboard/search')}`);
  }

  const query = parseParam(searchParams?.q ?? '').trim();
  const typesParam = parseParam(searchParams?.types ?? '');
  const types = parseSearchTypes(typesParam);

  const offsets: Record<SearchResultType, number> = {
    users: parseSearchOffset(parseParam(searchParams?.usersOffset ?? '')), 
    plans: parseSearchOffset(parseParam(searchParams?.plansOffset ?? '')),
    exercises: parseSearchOffset(parseParam(searchParams?.exercisesOffset ?? '')),
    sessions: parseSearchOffset(parseParam(searchParams?.sessionsOffset ?? '')),
  };

  const viewerRole = toAppRole(session.role ?? session.user?.role ?? null) ?? 'ADMIN';
  const viewerName = getViewerName(session);

  const fallback = getSearchDashboardFallback({ query, types });

  const sb = tryCreateServerClient();
  if (!sb) {
    const payload: SearchDashboardResponse = { ...fallback, ok: true, source: 'fallback' };
    return (
      <SearchClient
        initialQuery={query}
        initialTypes={types}
        initialOffsets={offsets}
        initialData={payload}
        viewerName={viewerName}
        viewerRole={viewerRole}
      />
    );
  }

  try {
    const collections = await fetchSearchCollections(sb, {
      query,
      types,
      offsets,
    });
    const dataset = buildSearchDashboard({
      query,
      collections,
      fallback: false,
      now: new Date(),
    });
    const payload: SearchDashboardResponse = { ...dataset, ok: true, source: 'supabase' };
    return (
      <SearchClient
        initialQuery={query}
        initialTypes={types}
        initialOffsets={offsets}
        initialData={payload}
        viewerName={viewerName}
        viewerRole={viewerRole}
      />
    );
  } catch (error) {
    console.error('[dashboard.search]', error);
    const payload: SearchDashboardResponse = { ...fallback, ok: true, source: 'fallback' };
    return (
      <SearchClient
        initialQuery={query}
        initialTypes={types}
        initialOffsets={offsets}
        initialData={payload}
        viewerName={viewerName}
        viewerRole={viewerRole}
      />
    );
  }
}
