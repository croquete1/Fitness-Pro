import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requirePtOrAdminGuard, isGuardErr } from '@/lib/api-guards';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const guard = await requirePtOrAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const planId = params.id;
  const body = await req.json().catch(() => ({}));

  const sb = createServerClient();

  // garantir ownership se for PT
  if (guard.me.role !== 'ADMIN') {
    const { data: plan, error: planErr } = await sb
      .from('training_plans')
      .select('id, trainer_id')
      .eq('id', planId)
      .maybeSingle();
    if (planErr || !plan || String(plan.trainer_id) !== guard.me.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  if (body?.kind === 'days') {
    const order: string[] = Array.isArray(body.order) ? body.order : [];
    // atualiza posição (0..n)
    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      await sb.from('plan_days').update({ position: i }).eq('id', id).eq('plan_id', planId);
    }
    return NextResponse.json({ ok: true });
  }

  if (body?.kind === 'exercises') {
    const dayId: string | undefined = body.dayId;
    const order: string[] = Array.isArray(body.order) ? body.order : [];
    if (!dayId) return NextResponse.json({ error: 'missing dayId' }, { status: 400 });

    for (let i = 0; i < order.length; i++) {
      await sb
        .from('plan_exercises')
        .update({ position: i, day_id: dayId })
        .eq('id', order[i]);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'bad request' }, { status: 400 });
}
