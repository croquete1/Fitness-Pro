// src/app/api/pt/plans/move-exercise/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { planId, exerciseId, toDayId, toIndex } = await req.json().catch(() => ({} as any));
  if (!planId || !exerciseId || !toDayId || typeof toIndex !== 'number') {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const sb = createServerClient();

  // 1) Mover o exercício para o novo dia (se mudou) e posição provisória alta para evitar conflito
  const { error: upErr } = await sb
    .from('plan_exercises')
    .update({ day_id: toDayId, position: 999999 })
    .eq('id', exerciseId)
    .eq('plan_id', planId);

  if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

  // 2) Buscar lista alvo e reindexar
  const { data: list, error: listErr } = await sb
    .from('plan_exercises')
    .select('id')
    .eq('plan_id', planId)
    .eq('day_id', toDayId)
    .order('position', { ascending: true });

  if (listErr) return NextResponse.json({ ok: false, error: listErr.message }, { status: 500 });

  // insere exerciseId em toIndex
  const ids = (list ?? []).map((e) => e.id).filter((id: string) => id !== exerciseId);
  const idx = Math.max(0, Math.min(toIndex, ids.length));
  ids.splice(idx, 0, exerciseId);

  // 3) Persistir nova ordem
  for (let i = 0; i < ids.length; i++) {
    const { error } = await sb.from('plan_exercises').update({ position: i }).eq('id', ids[i]);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
