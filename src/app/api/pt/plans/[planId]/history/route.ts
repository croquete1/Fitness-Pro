import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ planId: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const { planId } = await ctx.params;
  const sb = createServerClient();
  const { data, error } = await sb
    .from('plan_changes')
    .select('id, plan_id, changed_by, change_type, created_at, meta')
    .eq('plan_id', planId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data ?? []);
}
