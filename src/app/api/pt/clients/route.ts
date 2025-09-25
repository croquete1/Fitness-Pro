import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(_req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ items: [] });

  const { data, error } = await sb
    .from('profiles')
    .select('id, full_name')
    .eq('trainer_id', user.id)
    .order('full_name', { ascending: true });

  return NextResponse.json({ items: (!error && Array.isArray(data) ? data : []) });
}
