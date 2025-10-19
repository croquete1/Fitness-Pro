import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { createServerClient } from '@/lib/supabaseServer';
import { buildSearchDashboard } from '@/lib/search/dashboard';
import { getSearchDashboardFallback } from '@/lib/fallback/search';
import {
  fetchSearchCollections,
  parseSearchOffset,
  parseSearchTypes,
} from '@/lib/search/server';
import type { SearchDashboardData, SearchResultType } from '@/lib/search/types';

export async function GET(req: NextRequest) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) {
    return guard.response;
  }

  const url = new URL(req.url);
  const term = (url.searchParams.get('q') ?? '').trim();
  const types = parseSearchTypes(url.searchParams.get('types'));

  const offsets: Record<SearchResultType, number> = {
    users: parseSearchOffset(url.searchParams.get('usersOffset')),
    plans: parseSearchOffset(url.searchParams.get('plansOffset')),
    exercises: parseSearchOffset(url.searchParams.get('exercisesOffset')),
    sessions: parseSearchOffset(url.searchParams.get('sessionsOffset')),
  };

  const sb = createServerClient();
  if (!sb) {
    const fallback = getSearchDashboardFallback({ query: term, types });
    return NextResponse.json({ ...fallback, ok: true, source: 'fallback' as const });
  }

  try {
    const collections = await fetchSearchCollections(sb, {
      query: term,
      types,
      offsets,
    });
    const dataset = buildSearchDashboard({
      query: term,
      collections,
      fallback: false,
      now: new Date(),
    });
    const payload: SearchDashboardData & { ok: true; source: 'supabase' } = {
      ...dataset,
      ok: true,
      source: 'supabase',
    };
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[api.search]', error);
    const fallback = getSearchDashboardFallback({ query: term, types });
    return NextResponse.json({ ...fallback, ok: true, source: 'fallback' as const });
  }
}
