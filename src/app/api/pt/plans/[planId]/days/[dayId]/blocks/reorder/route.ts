// src/app/api/pt/plans/[planId]/days/[dayId]/blocks/reorder/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Pair = { id: string; order_index: number };

type Ctx = { params: Promise<{ planId: string; dayId: string }> };

export async function POST(
  req: Request,
  ctx: Ctx
) {
  const { dayId } = await ctx.params;
  const sb = createServerClient();

  let body: { pairs?: Pair[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const pairs = Array.isArray(body.pairs) ? body.pairs : [];
  if (!pairs.length) {
    return NextResponse.json({ ok: true }); // nada para fazer
  }

  // (opcional) valida se todos pertencem ao mesmo day_id
  const ids = pairs.map((p) => p.id);
  const { data: belongs, error: belongsErr } = await sb
    .from('plan_blocks')
    .select('id, day_id')
    .in('id', ids);

  if (belongsErr) {
    return NextResponse.json({ error: 'Falha a validar blocos' }, { status: 400 });
  }
  if ((belongs ?? []).some((b) => b.day_id !== dayId)) {
    return NextResponse.json({ error: 'Blocos não pertencem ao dia' }, { status: 400 });
  }

  // Atualiza sequencialmente (simples e robusto)
  for (const p of pairs) {
    const { error } = await sb
      .from('plan_blocks')
      .update({ order_index: p.order_index })
      .eq('id', p.id);
    if (error) {
      return NextResponse.json({ error: 'Falha ao atualizar ordem' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
