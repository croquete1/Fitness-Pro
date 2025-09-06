// src/app/api/pt/sessions/check/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

type RawSession = {
  id: string;
  scheduled_at: string;
  duration_min: number | null;
  status: string | null;
  location?: string | null;       // texto
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;
  if (!meId) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const startIso = url.searchParams.get('start');
  const dur = Number(url.searchParams.get('dur') ?? 60);
  const baseBuffer = Math.max(0, Number(url.searchParams.get('buffer') ?? 10));
  const locLabel = url.searchParams.get('loc'); // nome do local (texto)

  if (!startIso || !Number.isFinite(dur) || dur <= 0) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const start = new Date(startIso);
  const end = new Date(start.getTime() + dur * 60_000);

  const sb = createServerClient();

  // 1) sessões +-1 dia
  const dayBefore = new Date(start); dayBefore.setDate(dayBefore.getDate() - 1);
  const dayAfter  = new Date(end);   dayAfter.setDate(dayAfter.getDate() + 1);

  const { data: ses, error: qErr } = await sb
    .from('sessions')
    .select('id, scheduled_at, duration_min, status, location')
    .eq('trainer_id', meId)
    .neq('status', 'cancelada')
    .gte('scheduled_at', dayBefore.toISOString())
    .lte('scheduled_at', dayAfter.toISOString());

  if (qErr) return new NextResponse(qErr.message, { status: 500 });

  // 2) bloqueios pessoais (tabela opcional: trainer_blocks)
  let blocks: { start_at: string; end_at: string }[] = [];
  try {
    const { data } = await sb
      .from('trainer_blocks')
      .select('start_at, end_at')
      .eq('trainer_id', meId)
      .lte('start_at', dayAfter.toISOString())
      .gte('end_at', dayBefore.toISOString());
    blocks = data ?? [];
  } catch { /* tabela pode não existir: ignora */ }

  // 3) travel extra (opcional) a partir do local escolhido
  let travelExtra = 0;
  if (locLabel) {
    try {
      const { data: loc } = await sb
        .from('trainer_locations')
        .select('name, travel_min')
        .eq('trainer_id', meId)
        .eq('name', locLabel)
        .single();
      travelExtra = Number(loc?.travel_min ?? 0);
    } catch { /* tabela pode não existir */ }
  }

  // conflitos
  const conflicts: { id?: string; start: string; end: string; type: 'overlap' | 'buffer' | 'block' }[] = [];

  // a) bloqueios
  for (const b of blocks) {
    const bStart = new Date(b.start_at);
    const bEnd = new Date(b.end_at);
    if (start < bEnd && end > bStart) {
      conflicts.push({ start: bStart.toISOString(), end: bEnd.toISOString(), type: 'block' });
    }
  }

  // b) sessões
  for (const s of (ses ?? []) as RawSession[]) {
    const sStart = new Date(s.scheduled_at);
    const sEnd = new Date(sStart.getTime() + (Number(s.duration_min || 60) * 60_000));

    // overlap clássico
    if (start < sEnd && end > sStart) {
      conflicts.push({ id: s.id, start: sStart.toISOString(), end: sEnd.toISOString(), type: 'overlap' });
      continue;
    }

    // buffer dinâmico: se local diferente, adiciona travelExtra
    const extra = locLabel && s.location && s.location !== locLabel ? travelExtra : 0;
    const eff = baseBuffer + extra;

    const nearPrev = Math.abs(start.getTime() - sEnd.getTime()) < eff * 60_000;
    const nearNext = Math.abs(sStart.getTime() - end.getTime()) < eff * 60_000;
    if (nearPrev || nearNext) {
      conflicts.push({ id: s.id, start: sStart.toISOString(), end: sEnd.toISOString(), type: 'buffer' });
    }
  }

  return NextResponse.json({
    ok: true,
    conflict: conflicts.length > 0,
    conflicts,
    bufferMin: baseBuffer,
    travelExtra,
  });
}
