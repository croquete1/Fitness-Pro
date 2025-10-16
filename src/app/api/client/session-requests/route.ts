import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import {
  detectScheduleConflicts,
  ensureFuture,
  mapRequestRow,
  type SessionRequestStatus,
} from '@/lib/server/sessionRequests';

const BodySchema = z.object({
  trainerId: z.string().min(1, 'trainerId'),
  start: z.string().min(1, 'start'),
  end: z.string().min(1, 'end'),
  note: z.string().max(2000).optional(),
});

export async function GET(req: Request) {
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
    return supabaseFallbackJson({ requests: [] });
  }

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get('status') ?? '';

  let query = sb
    .from('session_requests' as any)
    .select(
      'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, trainer:users!session_requests_trainer_id_fkey(id,name,email)'
    )
    .eq('client_id', me.user.id)
    .order('created_at', { ascending: false })
    .limit(200);

  if (statusFilter) {
    if (statusFilter === 'open') {
      query = query.in('status', ['pending', 'reschedule_pending']);
    } else {
      query = query.eq('status', statusFilter as SessionRequestStatus);
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const requests = (data ?? []).map(mapRequestRow);
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
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

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (error: any) {
    return NextResponse.json({ error: 'INVALID_BODY', details: error?.message ?? String(error) }, { status: 400 });
  }

  const start = new Date(body.start);
  const end = new Date(body.end);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: 'INVALID_RANGE', details: 'Data/hora inválida.' }, { status: 400 });
  }
  if (end <= start) {
    return NextResponse.json({ error: 'INVALID_RANGE', details: 'A hora de fim deve ser posterior ao início.' }, { status: 400 });
  }
  if (!ensureFuture(start)) {
    return NextResponse.json({ error: 'PAST_RANGE', details: 'Escolhe uma data no futuro.' }, { status: 400 });
  }

  const trainerId = body.trainerId.trim();

  const { data: trainer, error: trainerError } = await sb
    .from('users' as any)
    .select('id, role, status, name, email')
    .eq('id', trainerId)
    .maybeSingle();

  if (trainerError) {
    return NextResponse.json({ error: trainerError.message }, { status: 400 });
  }
  if (!trainer || (trainer.role ?? '').toUpperCase() !== 'TRAINER') {
    return NextResponse.json({ error: 'INVALID_TRAINER' }, { status: 404 });
  }
  if ((trainer.status ?? '').toUpperCase() === 'SUSPENDED') {
    return NextResponse.json({ error: 'TRAINER_UNAVAILABLE' }, { status: 409 });
  }

  const conflict = await detectScheduleConflicts({
    supabase: sb,
    trainerId,
    clientId: me.user.id,
    start,
    end,
  });
  if (conflict.hasConflict) {
    return NextResponse.json({ error: 'CONFLICT', conflicts: conflict.conflicts }, { status: 409 });
  }

  const payload = {
    trainer_id: trainerId,
    client_id: me.user.id,
    requested_start: start.toISOString(),
    requested_end: end.toISOString(),
    message: body.note?.trim() ? body.note.trim() : null,
  };

  const { data, error } = await sb
    .from('session_requests' as any)
    .insert(payload)
    .select(
      'id, session_id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, proposed_by, responded_by, trainer:users!session_requests_trainer_id_fkey(id,name,email)'
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ request: mapRequestRow({ ...data, trainer }) }, { status: 201 });
}
