// src/app/api/pt/training-plans/[id]/move-exercise/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { isGuardErr, requirePtOrAdminGuard } from '@/lib/api-guards';

type Body = { exerciseId: string; fromDayId: string; toDayId: string; toIndex?: number };

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const guard = await requirePtOrAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!body.exerciseId || !body.fromDayId || !body.toDayId) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  const sb = createServerClient();

  // coloca no dia de destino, na posição pedida (ou fim)
  const { data: current } = await sb
    .from('plan_exercises' as const)
    .select('id')
    .eq('day_id', body.toDayId);

  const nextIndex = Number.isFinite(body.toIndex)
    ? Math.max(0, Number(body.toIndex))
    : (current?.length ?? 0);

  await sb
    .from('plan_exercises' as const)
    .update({ day_id: body.toDayId, order_index: nextIndex })
    .eq('id', body.exerciseId);

  return NextResponse.json({ ok: true });
}
