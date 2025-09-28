// src/app/api/pt/plans/[planId]/days/[dayId]/blocks/[blockId]/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(req: Request, { params }: { params: { planId: string; dayId: string; blockId: string } }) {
  const body = await req.json().catch(() => ({}));
  const sb = createServerClient();
  const { error } = await sb.from('plan_blocks').update(body).eq('id', params.blockId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { planId: string; dayId: string; blockId: string } }) {
  const sb = createServerClient();
  const { error } = await sb.from('plan_blocks').delete().eq('id', params.blockId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
