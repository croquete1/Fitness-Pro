import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id: planId } = await ctx.params;
  const body = await _req.json(); // [{id, order_index}, ...]
  if (!Array.isArray(body)) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const sb = createServerClient();
  // valida pertença, se necessário (admin/owner)
  for (const row of body) {
    const { error } = await sb.from('training_plan_blocks')
      .update({ order_index: row.order_index })
      .eq('id', row.id)
      .eq('plan_id', planId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
