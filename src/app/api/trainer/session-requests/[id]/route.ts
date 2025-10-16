import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import {
  computeDurationMinutes,
  detectScheduleConflicts,
  ensureFuture,
  mapRequestRow,
  requestedInterval,
} from '@/lib/server/sessionRequests';

const PatchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('accept') }),
  z.object({ action: z.literal('decline'), note: z.string().max(2000).optional() }),
  z.object({
    action: z.literal('propose_reschedule'),
    start: z.string().min(1),
    end: z.string().min(1),
    note: z.string().max(2000).optional(),
  }),
]);

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
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
      'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, client:users!session_requests_client_id_fkey(id,name,email), trainer:users!session_requests_trainer_id_fkey(id,name,email)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!requestRow) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  if (requestRow.trainer_id !== me.user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const nowIso = new Date().toISOString();
  let updatedRow = requestRow;

  if (body.action === 'accept') {
    if (requestRow.status !== 'pending') {
      return NextResponse.json({ error: 'INVALID_STATE' }, { status: 400 });
    }
    const interval = requestedInterval(mapRequestRow(requestRow));
    if (!interval) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }

    const conflict = await detectScheduleConflicts({
      supabase: sb,
      trainerId: requestRow.trainer_id,
      clientId: requestRow.client_id,
      start: interval.start,
      end: interval.end,
      excludeRequestId: requestRow.id,
    });
    if (conflict.hasConflict) {
      return NextResponse.json({ error: 'CONFLICT', conflicts: conflict.conflicts }, { status: 409 });
    }

    const duration = computeDurationMinutes(interval.start, interval.end) || 60;

    const { data: session, error: insertError } = await sb
      .from('sessions' as any)
      .insert({
        trainer_id: requestRow.trainer_id,
        client_id: requestRow.client_id,
        scheduled_at: interval.start.toISOString(),
        duration_min: duration,
      })
      .select('id, scheduled_at, duration_min')
      .maybeSingle();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    const { data: updated, error: updateError } = await sb
      .from('session_requests' as any)
      .update({
        status: 'accepted',
        session_id: session?.id ?? requestRow.session_id,
        responded_at: nowIso,
        responded_by: me.user.id,
      })
      .eq('id', id)
      .select(
        'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, client:users!session_requests_client_id_fkey(id,name,email), trainer:users!session_requests_trainer_id_fkey(id,name,email)'
      )
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
    updatedRow = updated ?? requestRow;
  }

  if (body.action === 'decline') {
    if (requestRow.status !== 'pending') {
      return NextResponse.json({ error: 'INVALID_STATE' }, { status: 400 });
    }
    const { data: updated, error: declineError } = await sb
      .from('session_requests' as any)
      .update({
        status: 'declined',
        trainer_note: body.note?.trim() ? body.note.trim() : requestRow.trainer_note ?? null,
        responded_at: nowIso,
        responded_by: me.user.id,
      })
      .eq('id', id)
      .select(
        'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, client:users!session_requests_client_id_fkey(id,name,email), trainer:users!session_requests_trainer_id_fkey(id,name,email)'
      )
      .maybeSingle();

    if (declineError) {
      return NextResponse.json({ error: declineError.message }, { status: 400 });
    }
    updatedRow = updated ?? requestRow;
  }

  if (body.action === 'propose_reschedule') {
    if (!requestRow.session_id) {
      return NextResponse.json({ error: 'SESSION_NOT_LINKED' }, { status: 400 });
    }
    if (requestRow.status !== 'accepted' && requestRow.status !== 'reschedule_declined') {
      return NextResponse.json({ error: 'INVALID_STATE' }, { status: 400 });
    }

    const start = new Date(body.start);
    const end = new Date(body.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: 'INVALID_RANGE' }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json({ error: 'INVALID_RANGE', details: 'Fim deve ser posterior ao início.' }, { status: 400 });
    }
    if (!ensureFuture(start)) {
      return NextResponse.json({ error: 'PAST_RANGE' }, { status: 400 });
    }

    const conflict = await detectScheduleConflicts({
      supabase: sb,
      trainerId: requestRow.trainer_id,
      clientId: requestRow.client_id,
      start,
      end,
      excludeSessionId: requestRow.session_id,
      excludeRequestId: requestRow.id,
    });
    if (conflict.hasConflict) {
      return NextResponse.json({ error: 'CONFLICT', conflicts: conflict.conflicts }, { status: 409 });
    }

    const { data: updated, error: proposeError } = await sb
      .from('session_requests' as any)
      .update({
        proposed_start: start.toISOString(),
        proposed_end: end.toISOString(),
        status: 'reschedule_pending',
        proposed_at: nowIso,
        proposed_by: me.user.id,
        reschedule_note: body.note?.trim() ? body.note.trim() : requestRow.reschedule_note ?? null,
      })
      .eq('id', id)
      .select(
        'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, client:users!session_requests_client_id_fkey(id,name,email), trainer:users!session_requests_trainer_id_fkey(id,name,email)'
      )
      .maybeSingle();

    if (proposeError) {
      return NextResponse.json({ error: proposeError.message }, { status: 400 });
    }
    updatedRow = updated ?? requestRow;
  }

  return NextResponse.json({ request: mapRequestRow(updatedRow) });
}
