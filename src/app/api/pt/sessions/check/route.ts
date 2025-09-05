// src/app/api/pt/sessions/check/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

type Conflict = {
  id: string;
  start: string;
  end: string;
  type: 'overlap' | 'buffer';
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const startIso = url.searchParams.get('start');
  const durationMin = Number(url.searchParams.get('dur') ?? 60);
  const bufferMin = Math.max(0, Number(url.searchParams.get('buffer') ?? 10));

  if (!startIso || !Number.isFinite(durationMin) || durationMin <= 0) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMin * 60_000);

  const sb = createServerClient();

  // buscar sessões ±1 dia para apanhar vizinhos
  const dayBefore = new Date(start); dayBefore.setDate(dayBefore.getDate() - 1);
  const dayAfter  = new Date(end);   dayAfter.setDate(dayAfter.getDate() + 1);

  const { data, error } = await sb
    .from('sessions')
    .select('id, scheduled_at, duration_min, status')
    .eq('trainer_id', meId)
    .neq('status', 'cancelada')
    .gte('scheduled_at', dayBefore.toISOString())
    .lte('scheduled_at', dayAfter.toISOString());

  if (error) return new NextResponse(error.message, { status: 500 });

  const conflicts: Conflict[] = [];
  for (const s of (data ?? [])) {
    const sStart = new Date(s.scheduled_at);
    const sEnd = new Date(sStart.getTime() + (Number(s.duration_min || 60) * 60_000));

    const overlap = start < sEnd && end > sStart;
    const bufferHit =
      !overlap &&
      (Math.abs(start.getTime() - sEnd.getTime()) < bufferMin * 60_000 ||
       Math.abs(sStart.getTime() - end.getTime()) < bufferMin * 60_000);

    if (overlap || bufferHit) {
      conflicts.push({
        id: s.id,
        start: sStart.toISOString(),
        end: sEnd.toISOString(),
        type: overlap ? 'overlap' : 'buffer',
      });
    }
  }

  return NextResponse.json({
    ok: true,
    conflict: conflicts.length > 0,
    conflicts,
    bufferMin,
  });
}
