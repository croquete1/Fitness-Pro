import { NextResponse } from 'next/server';
import { isGuardErr, requireAdminGuard } from '@/lib/api-guards';
import { getSampleAdminRoster } from '@/lib/fallback/admin';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';

export const dynamic = 'force-dynamic';

type QueryOptions = {
  search: string;
  status: string;
  shift: string;
};

type RosterRow = {
  id: string;
  trainer_id: string;
  trainer_name: string | null;
  trainer_focus: string | null;
  status: string | null;
  shift: string | null;
  clients_count: number | null;
  highlighted_client_id: string | null;
  highlighted_client_name: string | null;
  next_check_in_at: string | null;
  load_level: string | null;
  tags: string[] | null;
  last_synced_at: string | null;
  metadata: Record<string, unknown> | null;
};

type RosterEvent = {
  id: string;
  assignment_id: string | null;
  owner_id: string | null;
  owner_name: string | null;
  title: string | null;
  detail: string | null;
  scheduled_at: string | null;
  metadata: Record<string, unknown> | null;
};

type ApiPayload = {
  assignments?: RosterRow[];
  timeline?: RosterEvent[];
  count?: number;
  error?: string;
  _supabaseConfigured?: boolean;
};

function parseQuery(url: URL): QueryOptions {
  return {
    search: (url.searchParams.get('q') || '').trim(),
    status: (url.searchParams.get('status') || '').trim().toLowerCase(),
    shift: (url.searchParams.get('shift') || '').trim().toLowerCase(),
  };
}

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const url = new URL(req.url);
  const { search, status, shift } = parseQuery(url);
  const sb = tryCreateServerClient();

  if (!sb) {
    const fallback = getSampleAdminRoster();
    return supabaseFallbackJson(
      {
        assignments: fallback.assignments,
        timeline: fallback.timeline,
        count: fallback.count,
        _supabaseConfigured: false,
      },
      { status: 200 },
    );
  }

  try {
    const headers = { 'cache-control': 'no-store' as const };
    let query = sb.from('admin_trainer_roster').select('*', { count: 'exact' });

    if (search) {
      const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
      query = query.or(
        `trainer_name.ilike.%${escaped}%,trainer_focus.ilike.%${escaped}%,highlighted_client_name.ilike.%${escaped}%,tags_text.ilike.%${escaped}%`,
      );
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (shift) {
      query = query.eq('shift', shift);
    }

    const roster = await query
      .order('last_synced_at', { ascending: false, nullsFirst: false })
      .order('trainer_name', { ascending: true, nullsFirst: false });

    if (roster.error) {
      const code = roster.error.code ?? '';
      if (code === '42P01' || code === 'PGRST301' || code === 'PGRST205') {
        const fallback = getSampleAdminRoster();
        return supabaseFallbackJson(
          {
            assignments: fallback.assignments,
            timeline: fallback.timeline,
            count: fallback.count,
            _supabaseConfigured: false,
          },
          { status: 200 },
        );
      }
      console.warn('[admin/roster] list failed', { code });
      return supabaseUnavailableResponse();
    }

    const assignments = (roster.data ?? []) as RosterRow[];
    const count = typeof roster.count === 'number' ? roster.count : assignments.length;
    let timeline: RosterEvent[] = [];

    if (assignments.length > 0) {
      const ids = assignments.map((row) => row.id).filter(Boolean);
      const timelineQuery = sb
        .from('admin_trainer_roster_events')
        .select('*')
        .order('scheduled_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(50);

      const events = ids.length ? await timelineQuery.in('assignment_id', ids) : await timelineQuery;
      if (!events.error) {
        timeline = (events.data ?? []) as RosterEvent[];
      } else {
        const code = events.error.code ?? '';
        if (!(code === '42P01' || code === 'PGRST301' || code === 'PGRST205')) {
          console.warn('[admin/roster] events failed', { code });
        }
      }
    }

    const payload: ApiPayload = {
      assignments,
      timeline,
      count,
      _supabaseConfigured: true,
    };

    return NextResponse.json(payload, { headers });
  } catch (error) {
    console.error('[admin/roster] unexpected error', error);
    return NextResponse.json(
      { assignments: [], timeline: [], count: 0, error: 'UNEXPECTED' } satisfies ApiPayload,
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }
}
