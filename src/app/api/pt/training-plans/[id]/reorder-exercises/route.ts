// src/app/api/pt/training-plans/[id]/reorder-exercises/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { isGuardErr, requirePtOrAdminGuard } from '@/lib/api-guards';

type Body = { dayId: string; exerciseIds: string[] };

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

  if (!body.dayId || !Array.isArray(body.exerciseIds)) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
  }

  const sb = createServerClient();

  for (let i = 0; i < body.exerciseIds.length; i++) {
    const id = body.exerciseIds[i];
    await sb
      .from('plan_exercises' as const)
      .update({ order_index: i })
      .eq('id', id)
      .eq('day_id', body.dayId);
  }

  return NextResponse.json({ ok: true });
}
