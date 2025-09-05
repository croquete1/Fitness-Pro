// src/app/api/pt/sessions/route.ts  (criar sessão com proteção de buffer)
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
  start: string;        // ISO
  duration_min: number; // obrigatório
  location?: string | null;
  notes?: string | null;
  buffer_min?: number;  // opcional, default 10
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole((user as any).role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.client_id || !body.start || !Number.isFinite(body.duration_min) || body.duration_min <= 0) {
    return new NextResponse('Campos inválidos', { status: 400 });
  }
  const bufferMin = Math.max(0, Number(body.buffer_min ?? 10));
  const start = new Date(body.start);
  const end = new Date(start.getTime() + body.duration_min * 60_000);

  const sb = createServerClient();

  // verificação de conflitos (igual à rota /check)
  const dayBefore = new Date(start); dayBefore.setDate(dayBefore.getDate() - 1);
  const dayAfter  = new Date(end);   dayAfter.setDate(dayAfter.getDate() + 1);

  const { data: list, error: qErr } = await sb
    .from('sessions')
    .select('id, scheduled_at, duration_min, status')
    .eq('trainer_id', String(user.id))
    .neq('status', 'cancelada')
    .gte('scheduled_at', dayBefore.toISOString())
    .lte('scheduled_at', dayAfter.toISOString());

  if (qErr) return new NextResponse(qErr.message, { status: 500 });

  for (const s of (list ?? [])) {
    const sStart = new Date(s.scheduled_at);
    const sEnd = new Date(sStart.getTime() + (Number(s.duration_min || 60) * 60_000));
    const overlap = start < sEnd && end > sStart;
    const bufferHit =
      !overlap &&
      (Math.abs(start.getTime() - sEnd.getTime()) < bufferMin * 60_000 ||
       Math.abs(sStart.getTime() - end.getTime()) < bufferMin * 60_000);

    if (overlap) {
      return new NextResponse('Impossível marcar: já existe uma sessão nesse intervalo.', { status: 409 });
    }
    if (bufferHit) {
      return new NextResponse(
        `Respeita o intervalo de ${bufferMin} minutos entre sessões.`,
        { status: 409 }
      );
    }
  }

  // criar
  const { data, error: insErr } = await sb
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
    .select('id, trainer_id, client_id, scheduled_at, duration_min')
    .single();

  if (insErr) return new NextResponse(insErr.message, { status: 500 });

  await notifyUsers([{ userId: data.client_id }], {
    title: 'Nova sessão de treino',
    body: `Sessão marcada para ${new Date(data.scheduled_at).toLocaleString('pt-PT')}.`,
    url: '/dashboard/sessions',
    kind: 'session',
  });

  return NextResponse.json({ ok: true, session: data });
}
