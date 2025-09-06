import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Body = {
  start?: string; // ISO
  end?: string;   // ISO
  client_id?: string | null;
  location_id?: string | null;
};

// util
const addMin = (iso: string, min: number) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + min);
  return d.toISOString();
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = toAppRole((session as any)?.user?.role);
  const trainerId = String((session as any)?.user?.id || '');

  if (!trainerId) return new NextResponse('Unauthorized', { status: 401 });
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.start || !body.end) return new NextResponse('start/end obrigatórios', { status: 400 });

  const sb = createServerClient();

  // === validações básicas ===
  const start = new Date(body.start);
  const end = new Date(body.end);
  if (!(start < end)) return new NextResponse('Intervalo inválido', { status: 400 });

  // Janela do dia (para reduzir query)
  const dayStart = new Date(start); dayStart.setHours(0,0,0,0);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

  // Sessões do próprio nesse dia
  const { data: daySessions = [], error: sErr } = await sb
    .from('pt_sessions')
    .select('id,start,end,location_id')
    .eq('trainer_id', trainerId)
    .gte('start', dayStart.toISOString())
    .lt('start', dayEnd.toISOString())
    .order('start', { ascending: true });

  if (sErr) return new NextResponse(sErr.message, { status: 500 });

  // Folgas do próprio com qualquer overlap
  const { data: folgas = [], error: fErr } = await sb
    .from('pt_time_off')
    .select('id,start,end,title')
    .eq('trainer_id', trainerId)
    .gte('end', dayStart.toISOString())     // termina depois do início do dia
    .lte('start', dayEnd.toISOString());    // começa antes do fim do dia

  if (fErr) return new NextResponse(fErr.message, { status: 500 });

  // overlap helper
  const overlap = (aS: Date, aE: Date, bS: Date, bE: Date) => aS < bE && bS < aE;

  // Conflito com folgas
  for (const bl of folgas) {
    const bs = new Date(bl.start); const be = new Date(bl.end);
    if (overlap(start, end, bs, be)) {
      return new NextResponse(`Conflito com folga: ${bl.title ?? 'Folga'}`, { status: 409 });
    }
  }

  // Buffer dinâmico (deslocação) se mudar de local
  let needBefore = 0, needAfter = 0;
  if (body.location_id) {
    const { data: locs = [] } = await sb
      .from('pt_locations')
      .select('id,travel_min')
      .in('id', [
        body.location_id,
        ...(daySessions.map(s => s.location_id).filter(Boolean) as string[]),
      ]);

    const travelOf = (id?: string | null) =>
      Math.max(0, Number(locs.find(l => l.id === id)?.travel_min ?? 0));

    // sessão imediatamente antes / depois
    const prev = [...daySessions].filter(s => new Date(s.end) <= start).pop();
    const next = [...daySessions].find(s => new Date(s.start) >= end);

    if (prev && prev.location_id && prev.location_id !== body.location_id) {
      needBefore = Math.max(travelOf(prev.location_id), travelOf(body.location_id));
      const limit = new Date(prev.end);
      limit.setMinutes(limit.getMinutes() + needBefore);
      if (start < limit) {
        return new NextResponse(`Precisas de ${needBefore} min de deslocação após a sessão anterior.`, { status: 409 });
      }
    }
    if (next && next.location_id && next.location_id !== body.location_id) {
      needAfter = Math.max(travelOf(next.location_id), travelOf(body.location_id));
      const limit = addMin(body.end, needAfter);
      if (new Date(limit) > new Date(next.start)) {
        return new NextResponse(`Precisas de ${needAfter} min de deslocação antes da sessão seguinte.`, { status: 409 });
      }
    }
  }

  // Conflito direto com sessões
  for (const s of daySessions) {
    const ss = new Date(s.start); const se = new Date(s.end);
    if (overlap(start, end, ss, se)) {
      return new NextResponse('Conflito com outra sessão', { status: 409 });
    }
  }

  // Inserir
  const { data, error } = await sb
    .from('pt_sessions')
    .insert({
      trainer_id: trainerId,
      client_id: body.client_id ?? null,
      location_id: body.location_id ?? null,
      start: body.start,
      end: body.end,
      title: null,
    })
    .select('id,trainer_id,client_id,location_id,start,end,title')
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ ok: true, session: data });
}
