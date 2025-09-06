import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get('scope') || 'admin') as 'client'|'pt'|'admin';
  const id = searchParams.get('id') || undefined;

  const now = new Date();
  const start = new Date(now); start.setHours(now.getHours() - 23, 0, 0, 0);

  const hours: { date: string; count: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const h0 = new Date(start); h0.setHours(start.getHours() + i, 0, 0, 0);
    const h1 = new Date(h0);    h1.setHours(h0.getHours() + 1);

    let q = sb.from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', h0.toISOString())
      .lt('start_time', h1.toISOString());

    if (scope === 'client' && id) q = q.eq('client_id', id);
    if (scope === 'pt' && id)      q = q.eq('trainer_id', id);

    const { count } = await q;
    hours.push({ date: h0.toISOString(), count: count ?? 0 });
  }

  return NextResponse.json({ hours });
}
