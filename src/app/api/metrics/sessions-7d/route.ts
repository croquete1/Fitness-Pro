import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get('scope') || 'admin') as 'client'|'pt'|'admin';
  const id = searchParams.get('id') || undefined;

  // últimos 7 dias (hoje incluído)
  const days: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d0 = new Date(now); d0.setHours(0,0,0,0); d0.setDate(d0.getDate() - i);
    const d1 = new Date(d0); d1.setDate(d1.getDate() + 1);

    let q = sb.from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', d0.toISOString())
      .lt('start_time', d1.toISOString());

    if (scope === 'client' && id) q = q.eq('client_id', id);
    if (scope === 'pt' && id)      q = q.eq('trainer_id', id);
    // admin => sem filtro

    const { count } = await q;
    days.push({ date: d0.toISOString(), count: count ?? 0 });
  }

  return NextResponse.json({ days });
}
