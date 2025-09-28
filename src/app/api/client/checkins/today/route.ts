import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error:'unauthenticated' }, { status:401 });

  const start = new Date(); start.setHours(0,0,0,0);
  const end   = new Date(); end.setHours(23,59,59,999);

  const { data } = await sb.from('sessions')
    .select('id, title, kind, start_at, trainer:profiles!sessions_trainer_id_fkey(full_name)')
    .eq('client_id', user.id)
    .gte('start_at', start.toISOString())
    .lte('start_at', end.toISOString())
    .order('start_at', { ascending:true });

  const presencialToday = (data ?? []).some((s:any) => String(s.kind||'').toUpperCase()==='PRESENCIAL');
  return NextResponse.json({ today: data ?? [], presencialToday });
}
