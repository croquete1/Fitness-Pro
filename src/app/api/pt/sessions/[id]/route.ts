import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(_req: NextRequest, { params }: { params: { id: string }}) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const { data, error } = await sb
    .from('sessions')
    .select('id, title, start_at, end_at, kind, status, core_exercise, client_id')
    .eq('id', params.id)
    .eq('trainer_id', user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item: data });
}
