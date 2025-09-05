// src/app/api/pt/summary/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();

  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0,0,0,0);
  const endToday = new Date(startToday); endToday.setDate(endToday.getDate() + 1);

  // sessões de hoje
  const { data: today } = await sb
    .from('sessions')
    .select('id, scheduled_at, duration_min, status')
    .eq('trainer_id', meId)
    .neq('status', 'cancelada')
    .gte('scheduled_at', startToday.toISOString())
    .lt('scheduled_at', endToday.toISOString())
    .order('scheduled_at', { ascending: true });

  // próximos 7 dias (mini calendário)
  const wStart = new Date(startToday);
  const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 7);
  const { data: week } = await sb
    .from('sessions')
    .select('id, scheduled_at, duration_min, status')
    .eq('trainer_id', meId)
    .neq('status', 'cancelada')
    .gte('scheduled_at', wStart.toISOString())
    .lt('scheduled_at', wEnd.toISOString())
    .order('scheduled_at', { ascending: true });

  // clientes ativos (via trainer_clients)
  const { data: links } = await sb
    .from('trainer_clients')
    .select('client_id')
    .eq('trainer_id', meId);

  // planos atualizados recentemente
  const since = new Date(); since.setDate(since.getDate() - 7);
  const { count: plansUpdated } = await sb
    .from('training_plans')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', meId)
    .gte('updated_at', since.toISOString());

  const nextSession = (today ?? []).find(s => new Date(s.scheduled_at) > now);

  return NextResponse.json({
    todayCount: (today ?? []).length,
    nextAt: nextSession?.scheduled_at ?? null,
    activeClients: new Set((links ?? []).map((l: any) => l.client_id)).size,
    plansUpdated: plansUpdated ?? 0,
    week: (week ?? []).map((s: any) => ({
      id: s.id,
      start: s.scheduled_at,
      end: new Date(new Date(s.scheduled_at).getTime() + (Number(s.duration_min || 60) * 60_000)).toISOString(),
    })),
  });
}
