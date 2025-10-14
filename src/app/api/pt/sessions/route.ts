import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { assertTrainerAvailability } from '@/lib/server/sessions/availability';

function dayBounds(iso: string) {
  const d = new Date(iso);
  const s = new Date(d); s.setHours(0,0,0,0);
  const e = new Date(d); e.setHours(23,59,59,999);
  return { start: s.toISOString(), end: e.toISOString() };
}

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const url = new URL(req.url);
  const from = url.searchParams.get('from') || new Date().toISOString();
  const to   = url.searchParams.get('to')   || new Date(Date.now() + 7*86400000).toISOString();

  const { data, error } = await sb
    .from('sessions')
    .select('id, client_id, title, kind, start_at, end_at, order_index, exercises')
    .eq('trainer_id', user.id)
    .gte('start_at', from)
    .lte('start_at', to)
    .order('start_at', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const b = await req.json().catch(()=>({}));
  const start = b.start ? new Date(b.start) : null;
  const durationMin = Number(b.durationMin || b.duration_min || 60);
  const end = start ? new Date(start.getTime() + durationMin*60000) : null;
  if (!start) return NextResponse.json({ error: 'start obrigatório' }, { status: 400 });

  try {
    if (!end) throw new Error('end inválido');
    await assertTrainerAvailability(sb, user.id, start, end);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Conflito na agenda' }, { status: 409 });
  }

  // next order_index para o dia
  const { start: D0, end: D1 } = dayBounds(start.toISOString());
  const { data: sameDay } = await sb
    .from('sessions')
    .select('order_index')
    .eq('trainer_id', user.id)
    .gte('start_at', D0)
    .lte('start_at', D1)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextIndex = sameDay && sameDay[0] ? (Number(sameDay[0].order_index) + 1) : 0;

  const insert: any = {
    trainer_id: user.id,
    client_id: b.client_id ?? null,
    title: b.title ?? 'Sessão',
    kind: b.kind ?? 'presencial',
    start_at: start.toISOString(),
    end_at: end?.toISOString() ?? null,
    order_index: nextIndex,
    exercises: Array.isArray(b.exercises) ? b.exercises : null,
    duration_min: durationMin,
  };

  const { data, error } = await sb.from('sessions').insert(insert).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, session: data });
}

/** PATCH
 * - { ids: string[] }                        → reordenar no mesmo dia
 * - { moves: { id, date, order_index }[] }   → mover sessão para outro dia (mantém hora)
 */
export async function PATCH(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const b = await req.json().catch(()=>({}));

  // Reordenar no mesmo dia
  if (Array.isArray(b.ids)) {
    const ids: string[] = b.ids.map((x: any) => String(x));
    for (let i = 0; i < ids.length; i++) {
      const { error } = await sb.from('sessions')
        .update({ order_index: i })
        .eq('id', ids[i])
        .eq('trainer_id', user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // Mover de dia (mantendo hora)
  if (Array.isArray(b.moves)) {
    for (const mv of b.moves) {
      const id = String(mv.id);
      const targetDate = new Date(String(mv.date)); // yyyy-mm-dd

      const cur = await sb
        .from('sessions')
        .select('start_at,end_at,duration_min,trainer_id')
        .eq('id', id)
        .eq('trainer_id', user.id)
        .single();
      if (cur.error || !cur.data?.start_at) continue;

      const curDate = new Date(cur.data.start_at);
      targetDate.setHours(curDate.getHours(), curDate.getMinutes(), 0, 0);

      const durationMin = Number(cur.data.duration_min ?? 0);
      const delta = cur.data.end_at
        ? new Date(cur.data.end_at).getTime() - curDate.getTime()
        : durationMin > 0
          ? durationMin * 60000
          : 60 * 60000;

      const newStart = targetDate;
      const newEnd = new Date(newStart.getTime() + delta);

      try {
        await assertTrainerAvailability(sb, user.id, newStart, newEnd, { excludeSessionId: id });
      } catch (error: any) {
        return NextResponse.json({ error: error?.message ?? 'Conflito na agenda' }, { status: 409 });
      }

      const upd: any = { start_at: newStart.toISOString() };
      if (typeof mv.order_index === 'number') upd.order_index = mv.order_index;
      if (cur.data.end_at) {
        upd.end_at = newEnd.toISOString();
      }
      if (durationMin > 0) {
        upd.duration_min = Math.round(delta / 60000);
      }

      const { error } = await sb.from('sessions')
        .update(upd)
        .eq('id', id)
        .eq('trainer_id', user.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
