import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request, { params }: { params: { planId: string; dayId: string } }) {
  const body = await req.json().catch(() => ({}));
  const sb = createServerClient();

  let pairs: Array<{ id: string; order_index: number }> = [];

  if (Array.isArray(body?.ids)) {
    pairs = body.ids.map((id: string, i: number) => ({ id, order_index: i + 1 }));
  } else if (Array.isArray(body?.pairs)) {
    pairs = body.pairs.map((p: any) => ({ id: String(p.id), order_index: Number(p.order_index) || 0 }));
  }

  if (!pairs.length) {
    return NextResponse.json({ error: 'payload inválido' }, { status: 400 });
  }

  // updates sequenciais simples → evita “excessively deep” de tipos
  for (const p of pairs) {
    const { error } = await sb.from('plan_day').update({ order_index: p.order_index }).eq('id', p.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, count: pairs.length });
}
