// src/app/api/pt/sessions/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { notifyUsers } from '@/lib/notify';

type Body = {
  client_id: string;
  start: string;        // ISO (obrigatório)
  duration_min: number; // obrigatório
  location?: string | null; // nome textual
  notes?: string | null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((user as any).role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.client_id || !body.start || !Number.isFinite(body.duration_min) || body.duration_min <= 0) {
    return new NextResponse('Campos obrigatórios em falta.', { status: 400 });
  }

  const start = new Date(body.start);
  const end = new Date(start.getTime() + body.duration_min * 60_000);

  const sb = createServerClient();

  // === VALIDAÇÃO (overlap/buffer/bloqueio) reaproveitando a mesma lógica ===
  const checkUrl = new URL('/api/pt/sessions/check', 'http://localhost'); // base dummy
  checkUrl.searchParams.set('start', start.toISOString());
  checkUrl.searchParams.set('dur', String(body.duration_min));
  checkUrl.searchParams.set('buffer', '10');
  if (body.location) checkUrl.searchParams.set('loc', body.location);

  // chamamos a função interna em vez de HTTP real:
  // para simplicidade no ambiente serverless, repetimos consulta localmente
  const dayBefore = new Date(start); dayBefore.setDate(dayBefore.getDate() - 1);
  const dayAfter  = new Date(end);   dayAfter.setDate(dayAfter.getDate() + 1);

  const { data: ses } = await sb
    .from('sessions')
    .select('id, scheduled_at, duration_min, status, location')
    .eq('trainer_id', String(user.id))
    .neq('status', 'cancelada')
    .gte('scheduled_at', dayBefore.toISOString())
    .lte('scheduled_at', dayAfter.toISOString());

  // bloqueios
  let blocks: { start_at: string; end_at: string }[] = [];
  try {
    const { data } = await sb
      .from('trainer_blocks')
      .select('start_at, end_at')
      .eq('trainer_id', String(user.id))
      .lte('start_at', dayAfter.toISOString())
      .gte('end_at', dayBefore.toISOString());
    blocks = data ?? [];
  } catch {}

  // travel extra
  let travelExtra = 0;
  if (body.location) {
    try {
      const { data: loc } = await sb
        .from('trainer_locations')
        .select('name, travel_min')
        .eq('trainer_id', String(user.id))
        .eq('name', body.location)
        .single();
      travelExtra = Number(loc?.travel_min ?? 0);
    } catch {}
  }

  const baseBuffer = 10;

  // bloqueio?
  for (const b of blocks) {
    const bStart = new Date(b.start_at);
    const bEnd = new Date(b.end_at);
    if (start < bEnd && end > bStart) {
      return new NextResponse('Indisponível nesse período.', { status: 409 });
    }
  }

  // overlap/buffer?
  for (const s of (ses ?? [])) {
    const sStart = new Date(s.scheduled_at);
    const sEnd = new Date(sStart.getTime() + (Number(s.duration_min || 60) * 60_000));

    if (start < sEnd && end > sStart) {
      return new NextResponse('Impossível marcar: já existe uma sessão nesse intervalo.', { status: 409 });
    }
    const extra = body.location && s.location && s.location !== body.location ? travelExtra : 0;
    const eff = baseBuffer + extra;

    const nearPrev = Math.abs(start.getTime() - sEnd.getTime()) < eff * 60_000;
    const nearNext = Math.abs(sStart.getTime() - end.getTime()) < eff * 60_000;
    if (nearPrev || nearNext) {
      return new NextResponse(`Respeita o intervalo de ${eff} minutos entre sessões.`, { status: 409 });
    }
  }

  // === criar ===
  const { data, error } = await sb
    .from('sessions')
    .insert({
      trainer_id: String(user.id),
      client_id: body.client_id,
      scheduled_at: start.toISOString(),
      duration_min: body.duration_min,
      location: body.location ?? null,
      status: 'pendente',
      notes: body.notes ?? null,
    })
    .select('id, client_id, scheduled_at')
    .single();

  if (error) return new NextResponse(error.message, { status: 500 });

  // notificar cliente
  try {
    await notifyUsers([{ userId: data.client_id }], {
      title: 'Nova sessão de treino',
      body: `Sessão marcada para ${new Date(data.scheduled_at).toLocaleString('pt-PT')}.`,
      url: '/dashboard/sessions',
      kind: 'session',
    });
  } catch {}

  return NextResponse.json({ ok: true, session: data });
}
