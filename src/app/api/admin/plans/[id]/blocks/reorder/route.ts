import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

type Ctx = { params: Promise<{ id: string }> };

type OrderPayload = { id: string; order_index: number };

type BodyShape =
  | OrderPayload[]
  | {
      order?: OrderPayload[];
    };

function normalisePayload(body: unknown): OrderPayload[] {
  if (Array.isArray(body)) {
    return body
      .map((row) => ({
        id: typeof row?.id === 'string' ? row.id : null,
        order_index: typeof row?.order_index === 'number' ? row.order_index : null,
      }))
      .filter((row): row is OrderPayload => Boolean(row.id) && row.order_index !== null);
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const orderField = (body as { order?: unknown }).order;
    const arr = Array.isArray(orderField) ? orderField : [];
    return arr
      .map((row) => ({
        id: typeof row?.id === 'string' ? row.id : null,
        order_index: typeof row?.order_index === 'number' ? row.order_index : null,
      }))
      .filter((row): row is OrderPayload => Boolean(row.id) && row.order_index !== null);
  }
  return [];
}

export async function POST(req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id: planId } = await ctx.params;
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const order = normalisePayload(body);
  if (!order.length) {
    return NextResponse.json({ ok: true });
  }

  const sb = createServerClient();

  const [{ data: plan, error: planError }, { data: before, error: beforeError }] = await Promise.all([
    sb
      .from('training_plans')
      .select('id, title')
      .eq('id', planId)
      .maybeSingle(),
    sb
      .from('training_plan_blocks')
      .select('id, title, order_index')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true }),
  ]);

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 400 });
  }
  if (!plan) {
    return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
  }
  if (beforeError) {
    return NextResponse.json({ error: beforeError.message }, { status: 400 });
  }

  for (const row of order) {
    const { error } = await sb
      .from('training_plan_blocks')
      .update({ order_index: row.order_index })
      .eq('id', row.id)
      .eq('plan_id', planId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  try {
    await logAudit(sb, {
      actorId: guard.me.id,
      kind: AUDIT_KINDS.TRAINING_PLAN_UPDATE,
      targetType: AUDIT_TARGET_TYPES.TRAINING_PLAN,
      targetId: planId,
      message: `Reordenação de blocos do plano "${plan.title ?? planId}"`,
      details: {
        before,
        after: order,
      },
    });
  } catch (error) {
    console.warn('[admin/plans/reorder-blocks] audit log failed', error);
  }

  return NextResponse.json({ ok: true });
}
