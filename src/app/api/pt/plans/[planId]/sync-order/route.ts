// src/app/api/pt/plans/[id]/sync-order/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

type Body = {
  days: { id: string; order_index: number }[];
  exercises: { id: string; day_id: string; order_index: number }[];
};

type Ctx = { params: Promise<{ planId: string }> };

export async function PATCH(
  req: Request,
  ctx: Ctx
) {
  const { planId } = await ctx.params;
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const role = toAppRole(me.role) ?? 'CLIENT';

  // garantir que o plano pertence ao PT (ou ADMIN)
  const { data: plan } = await sb
    .from('training_plans')
    .select('id, trainer_id')
    .eq('id', planId)
    .maybeSingle();

  if (!plan) return new NextResponse('Not found', { status: 404 });
  if (role !== 'ADMIN' && plan.trainer_id !== me.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Updates em lote (sem transação). Se precisares de atomicidade total, fazemos por RPC.
  try {
    if (Array.isArray(body.days) && body.days.length > 0) {
      await Promise.all(
        body.days.map(d =>
          sb.from('plan_days').update({ order_index: d.order_index }).eq('id', d.id)
        )
      );
    }
    if (Array.isArray(body.exercises) && body.exercises.length > 0) {
      await Promise.all(
        body.exercises.map(x =>
          sb.from('plan_exercises')
            .update({ day_id: x.day_id, order_index: x.order_index })
            .eq('id', x.id)
        )
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? 'Update failed', { status: 500 });
  }
}
