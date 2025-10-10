// src/app/api/pt/plans/[planId]/days/[dayId]/blocks/[blockId]/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ planId: string; dayId: string; blockId: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { blockId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const sb = createServerClient();
  const { error } = await sb.from('plan_blocks').update(body).eq('id', blockId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { blockId } = await ctx.params;
  const sb = createServerClient();
  const { error } = await sb.from('plan_blocks').delete().eq('id', blockId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
