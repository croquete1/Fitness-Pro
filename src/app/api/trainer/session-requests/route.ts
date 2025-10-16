import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { mapRequestRow, type SessionRequestStatus } from '@/lib/server/sessionRequests';

const QuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).optional(),
});

export async function GET(req: Request) {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  const role = toAppRole(me.user.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const sb = await tryGetSBC();
  if (!sb) {
    return supabaseFallbackJson({ requests: [] });
  }

  const url = new URL(req.url);
  const params = QuerySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  });
  if (!params.success) {
    return NextResponse.json({ error: 'INVALID_QUERY', details: params.error.message }, { status: 400 });
  }

  const { status, limit } = params.data;

  let query = sb
    .from('session_requests' as any)
    .select(
      'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, client:users!session_requests_client_id_fkey(id,name,email)'
    )
    .eq('trainer_id', me.user.id)
    .order('created_at', { ascending: false })
    .limit(limit ?? 200);

  if (status) {
    if (status === 'open') {
      query = query.in('status', ['pending', 'reschedule_pending']);
    } else {
      query = query.eq('status', status as SessionRequestStatus);
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const requests = (data ?? []).map(mapRequestRow);
  return NextResponse.json({ requests });
}
