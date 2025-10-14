import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { assertTrainerAvailability } from '@/lib/server/sessions/availability';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { data, error } = await sb.from('sessions').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const b = await req.json().catch(()=>({}));
  const upd: any = {};
  const currentRes = await sb
    .from('sessions')
    .select('trainer_id,start_at,end_at,duration_min')
    .eq('id', id)
    .single();

  if (currentRes.error || !currentRes.data) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
  }

  if (currentRes.data.trainer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const currentStart = currentRes.data.start_at ? new Date(currentRes.data.start_at) : null;
  const currentEnd = currentRes.data.end_at ? new Date(currentRes.data.end_at) : null;
  const currentDuration = Number(currentRes.data.duration_min ?? (currentEnd && currentStart ? (currentEnd.getTime() - currentStart.getTime()) / 60000 : 0));

  if ('title' in b) upd.title = b.title ? String(b.title) : null;
  if ('kind' in b) upd.kind = b.kind ? String(b.kind) : null;
  if ('start_at' in b) upd.start_at = b.start_at ? new Date(b.start_at).toISOString() : null;
  if ('end_at' in b) upd.end_at = b.end_at ? new Date(b.end_at).toISOString() : null;
  if ('client_id' in b) upd.client_id = b.client_id || null;
  if ('exercises' in b) upd.exercises = Array.isArray(b.exercises) ? b.exercises : null;
  if ('duration_min' in b) {
    const parsed = Number(b.duration_min);
    if (!Number.isNaN(parsed) && parsed > 0) {
      upd.duration_min = parsed;
    }
  }

  const nextStart = 'start_at' in b
    ? (b.start_at ? new Date(b.start_at) : null)
    : currentStart;

  const nextDurationMin = 'duration_min' in b && !Number.isNaN(Number(b.duration_min)) && Number(b.duration_min) > 0
    ? Number(b.duration_min)
    : currentDuration > 0
      ? currentDuration
      : 60;

  const nextEnd = 'end_at' in b
    ? (b.end_at ? new Date(b.end_at) : null)
    : nextStart
      ? (currentEnd && !('duration_min' in b)
          ? new Date(currentEnd.getTime())
          : new Date(nextStart.getTime() + nextDurationMin * 60000))
      : currentEnd;

  if (nextStart && nextEnd) {
    try {
      await assertTrainerAvailability(sb, user.id, nextStart, nextEnd, { excludeSessionId: id });
    } catch (error: any) {
      return NextResponse.json({ error: error?.message ?? 'Conflito na agenda' }, { status: 409 });
    }
    if (!('end_at' in b) && nextEnd) {
      upd.end_at = nextEnd.toISOString();
    }
  }

  const { error } = await sb.from('sessions').update(upd).eq('id', id).eq('trainer_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { error } = await sb.from('sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
