import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('plan_changes')
    .select('id, plan_id, changed_by, change_type, created_at, meta')
    .eq('plan_id', params.id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data ?? []);
}
