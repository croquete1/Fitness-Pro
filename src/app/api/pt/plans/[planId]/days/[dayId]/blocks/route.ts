// src/app/api/pt/plans/[planId]/days/[dayId]/blocks/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { dayId: string } }) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const { data, error } = await sb
    .from('training_plan_blocks' as any)
    .select('id, title, order_index')
    .eq('day_id', params.dayId)
    .order('order_index', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}
