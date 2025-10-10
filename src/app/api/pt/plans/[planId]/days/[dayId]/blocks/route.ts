// src/app/api/pt/plans/[planId]/days/[dayId]/blocks/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ planId: string; dayId: string }> };

export async function GET(
  _req: Request,
  ctx: Ctx
) {
  const { dayId } = await ctx.params;
  const sb = createServerClient();

  // Confirma que o dia existe (opcional)
  const { data: day, error: dayErr } = await sb
    .from('training_days')
    .select('id, plan_id, title, order_index')
    .eq('id', dayId)
    .single();

  if (dayErr || !day) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await sb
    .from('plan_blocks')
    .select('id, title, order_index')
    .eq('day_id', dayId)
    .order('order_index', { ascending: true, nullsFirst: true })
    .order('title', { ascending: true, nullsFirst: true });

  if (error) {
    return NextResponse.json({ items: [] });
  }

  return NextResponse.json({ items: data ?? [] });
}
