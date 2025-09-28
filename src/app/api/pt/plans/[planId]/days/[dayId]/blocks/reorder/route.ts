import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request, { params }: { params: { planId: string; dayId: string } }) {
  const { ids } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids[] obrigatório' }, { status: 400 });
  }

  const sb = createServerClient();
  let ok = 0;

  for (let i = 0; i < ids.length; i++) {
    const { error } = await sb
      .from('plan_day_blocks')
      .update({ order_index: i })
      .eq('id', ids[i])
      .eq('day_id', params.dayId);
    if (!error) ok++;
  }

  return NextResponse.json({ ok, total: ids.length });
}
