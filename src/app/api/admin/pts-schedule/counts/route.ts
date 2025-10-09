import { NextResponse } from 'next/server';
import { serverSB } from '@/lib/supabase/server';
import { supabaseConfigErrorResponse } from '@/lib/supabase/responses';

export async function GET() {
  let sb;
  try {
    sb = serverSB();
  } catch (err) {
    const res = supabaseConfigErrorResponse(err);
    if (res) return res;
    throw err;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday); startOfTomorrow.setDate(startOfToday.getDate() + 1);
  const startIn7 = new Date(startOfToday); startIn7.setDate(startOfToday.getDate() + 7);

  // hoje
  const { count: today = 0 } =
    await sb.from('sessions')
      .select('id', { count: 'exact', head: true })
      .gte('start_time', startOfToday.toISOString())
      .lt('start_time', startOfTomorrow.toISOString());

  // próximos 7 dias (inclui hoje)
  const { count: next7 = 0 } =
    await sb.from('sessions')
      .select('id', { count: 'exact', head: true })
      .gte('start_time', startOfToday.toISOString())
      .lt('start_time', startIn7.toISOString());

  return NextResponse.json({ today: today ?? 0, next7: next7 ?? 0 });
}
