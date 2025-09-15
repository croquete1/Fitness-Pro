// src/app/api/pt/sessions/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

function parseHhMm(dateISO: string, hhmm: string) {
  // cria Date a partir de YYYY-MM-DD + HH:MM (em UTC simples)
  const d = dateISO.slice(0, 10);
  return new Date(`${d}T${hhmm}:00Z`);
}
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export async function POST(req: Request) {
  const sb = createServerClient();
  const body = await req.json();

  const trainer_id = String(body.trainer_id);
  const client_id = String(body.client_id);
  const scheduled_at = String(body.scheduled_at);
  const duration_min = Number(body.duration_min ?? 60);
  const location = body.location ?? null;
  const notes = body.notes ?? null;

  if (!trainer_id || !client_id || !scheduled_at) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 });
  }

  // Janela da sessão
  const start = new Date(scheduled_at);
  const end = new Date(start.getTime() + duration_min * 60_000);
  const day = scheduled_at.slice(0, 10); // YYYY-MM-DD

  // Busca folgas do dia
  const { data: offs, error: eOff } = await sb
    .from('pt_days_off')
    .select('date,start_time,end_time')
    .eq('trainer_id', trainer_id)
    .eq('date', day);

  if (eOff) return NextResponse.json({ error: eOff.message }, { status: 500 });

  // Validação de bloqueio
  if (offs && offs.length > 0) {
    const blocked = offs.some((o) => {
      // Dia inteiro
      if (!o.start_time && !o.end_time) return true;
      // Janela com horas
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

  // Cria sessão
  const { data, error } = await sb
    .from('sessions')
    .insert({
      trainer_id,
      client_id,
      scheduled_at: start.toISOString(),
      duration_min,
      location,
      notes,
    })
    .select('id')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data?.id ?? null }, { status: 201 });
}
