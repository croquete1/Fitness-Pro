import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import {
  computeDurationMinutes,
  detectScheduleConflicts,
  mapRequestRow,
  proposedInterval,
} from '@/lib/server/sessionRequests';

const PatchSchema = z.object({
  action: z.enum(['cancel', 'accept_reschedule', 'decline_reschedule']),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  const role = toAppRole(me.user.role);
  if (role !== 'CLIENT' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const sb = await tryGetSBC();
  if (!sb) {
    return supabaseFallbackJson({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
  }

  const { id } = await ctx.params;
  let body: z.infer<typeof PatchSchema>;
  try {
    body = PatchSchema.parse(await req.json());
  } catch (error: any) {
    return NextResponse.json({ error: 'INVALID_BODY', details: error?.message ?? String(error) }, { status: 400 });
  }

  const { data: requestRow, error } = await sb
    .from('session_requests' as any)
    .select(
      'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, trainer:users!session_requests_trainer_id_fkey(id,name,email)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!requestRow) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  if (requestRow.client_id !== me.user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const nowIso = new Date().toISOString();
  let updatedRequest = requestRow;

  if (body.action === 'cancel') {
    if (requestRow.status !== 'pending') {
      return NextResponse.json({ error: 'INVALID_STATE' }, { status: 400 });
    }
    const { data: updated, error: updateError } = await sb
      .from('session_requests' as any)
      .update({
        status: 'cancelled',
        responded_at: nowIso,
        responded_by: me.user.id,
      })
      .eq('id', id)
      .select(
        'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, trainer:users!session_requests_trainer_id_fkey(id,name,email)'
      )
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    updatedRequest = updated ?? requestRow;
  }

  if (body.action === 'accept_reschedule') {
    if (requestRow.status !== 'reschedule_pending') {
      return NextResponse.json({ error: 'INVALID_STATE' }, { status: 400 });
    }
    const proposed = proposedInterval(mapRequestRow(requestRow));
    if (!proposed) {
      return NextResponse.json({ error: 'MISSING_PROPOSAL' }, { status: 400 });
    }
    if (!requestRow.session_id) {
      return NextResponse.json({ error: 'SESSION_NOT_LINKED' }, { status: 400 });
    }

    const conflict = await detectScheduleConflicts({
      supabase: sb,
      trainerId: requestRow.trainer_id,
      clientId: requestRow.client_id,
      start: proposed.start,
      end: proposed.end,
      excludeSessionId: requestRow.session_id,
      excludeRequestId: requestRow.id,
    });
    if (conflict.hasConflict) {
      return NextResponse.json({ error: 'CONFLICT', conflicts: conflict.conflicts }, { status: 409 });
    }

    const duration = computeDurationMinutes(proposed.start, proposed.end) || 60;

    const { error: updateSessionError } = await sb
      .from('sessions' as any)
      .update({
        scheduled_at: proposed.start.toISOString(),
        duration_min: duration,
      })
      .eq('id', requestRow.session_id)
      .eq('trainer_id', requestRow.trainer_id)
      .eq('client_id', requestRow.client_id);

    if (updateSessionError) {
      return NextResponse.json({ error: updateSessionError.message }, { status: 400 });
    }

    const { data: updated, error: updateRequestError } = await sb
      .from('session_requests' as any)
      .update({
        requested_start: proposed.start.toISOString(),
        requested_end: proposed.end.toISOString(),
        proposed_start: null,
        proposed_end: null,
        status: 'accepted',
        responded_at: nowIso,
        responded_by: me.user.id,
      })
      .eq('id', id)
      .select(
        'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, trainer:users!session_requests_trainer_id_fkey(id,name,email)'
      )
      .maybeSingle();

    if (updateRequestError) {
      return NextResponse.json({ error: updateRequestError.message }, { status: 400 });
    }
    updatedRequest = updated ?? requestRow;
  }

  if (body.action === 'decline_reschedule') {
    if (requestRow.status !== 'reschedule_pending') {
      return NextResponse.json({ error: 'INVALID_STATE' }, { status: 400 });
    }
    const { data: updated, error: declineError } = await sb
      .from('session_requests' as any)
      .update({
        proposed_start: null,
        proposed_end: null,
        status: 'reschedule_declined',
        responded_at: nowIso,
        responded_by: me.user.id,
      })
      .eq('id', id)
      .select(
        'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, trainer:users!session_requests_trainer_id_fkey(id,name,email)'
      )
      .maybeSingle();

    if (declineError) {
      return NextResponse.json({ error: declineError.message }, { status: 400 });
    }
    updatedRequest = updated ?? requestRow;
  }

  return NextResponse.json({ request: mapRequestRow(updatedRequest) });
}
