// src/app/api/pt/sessions/[id]/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

function parseHhMm(dateISO: string, hhmm: string) {
  const d = dateISO.slice(0, 10);
  return new Date(`${d}T${hhmm}:00Z`);
}
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sb = createServerClient();
  const body = await req.json();

  // Carrega a sessão atual
  const { data: s, error: eLoad } = await sb
    .from('sessions')
    .select('id, trainer_id, scheduled_at, duration_min, location, notes')
    .eq('id', params.id)
    .maybeSingle();

  if (eLoad || !s) {
    return NextResponse.json({ error: eLoad?.message ?? 'Sessão não encontrada.' }, { status: 404 });
  }

  const trainer_id = s.trainer_id;
  const scheduled_at = String(body.scheduled_at ?? s.scheduled_at);
  const duration_min = Number(body.duration_min ?? s.duration_min);
  const location = body.location ?? s.location ?? null;
  const notes = body.notes ?? s.notes ?? null;

  // Validação de folga
  const start = new Date(scheduled_at);
  const end = new Date(start.getTime() + duration_min * 60_000);
  const day = scheduled_at.slice(0, 10);

  const { data: offs, error: eOff } = await sb
    .from('pt_days_off')
    .select('date,start_time,end_time')
    .eq('trainer_id', trainer_id)
    .eq('date', day);

  if (eOff) return NextResponse.json({ error: eOff.message }, { status: 500 });

  if (offs && offs.length > 0) {
    const blocked = offs.some((o) => {
      if (!o.start_time && !o.end_time) return true;
      if (o.start_time && o.end_time) {
        const bStart = parseHhMm(scheduled_at, o.start_time);
        const bEnd = parseHhMm(scheduled_at, o.end_time);
        return overlaps(start, end, bStart, bEnd);
      }
      return false;
    });
    if (blocked) {
      return NextResponse.json(
        { error: 'Indisponível: existe folga do treinador neste período.' },
        { status: 409 }
      );
    }
  }

  const { error: eUpd } = await sb
    .from('sessions')
    .update({
      scheduled_at: start.toISOString(),
      duration_min,
      location,
      notes,
    })
    .eq('id', params.id);

  if (eUpd) return NextResponse.json({ error: eUpd.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
