// src/app/api/pt/plans/[planId]/days/[dayId]/blocks/[blockId]/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Ctx = { params: { planId: string; dayId: string; blockId: string } };

export async function GET(_req: Request, ctx: Ctx) {
  const { blockId } = ctx.params;
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const { data, error } = await sb
    .from('training_plan_blocks' as any)
    .select('id, day_id, title, notes, order_index, created_at, updated_at')
    .eq('id', blockId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ block: data });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { planId, dayId, blockId } = ctx.params;
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  if (typeof body.title === 'string') patch.title = body.title;
  if (typeof body.notes === 'string') patch.notes = body.notes;
  if (Number.isInteger(body.order_index)) patch.order_index = body.order_index;

  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true });

  const { error } = await sb
    .from('training_plan_blocks' as any)
    .update(patch)
    .eq('id', blockId)
    .eq('day_id', dayId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { blockId } = ctx.params;
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const { error } = await sb
    .from('training_plan_blocks' as any)
    .delete()
    .eq('id', blockId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
