import { NextResponse } from 'next/server';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson, supabaseConfigErrorResponse } from '@/lib/supabase/responses';

export async function GET(req: Request) {
  try {
    const sb = await tryGetSBC();
    if (!sb) return supabaseFallbackJson({ hasConflict: false });
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start_time');
    const end = searchParams.get('end_time');
    const trainer = searchParams.get('trainer_id');
    const client = searchParams.get('client_id');
    const exclude = searchParams.get('exclude_id');

    if (!start || !end) return NextResponse.json({ hasConflict: false });

    let q = sb.from('sessions')
      .select('id,trainer_id,client_id,start_time,end_time');

    const orFilters = [
      trainer ? `trainer_id.eq.${trainer}` : '',
      client ? `client_id.eq.${client}` : '',
    ].filter(Boolean).join(',');

    if (orFilters) {
      q = q.or(orFilters);
    }

    // Filter sessions that overlap the requested interval: start_time < end AND end_time > start
    q = q.lt('start_time', end).gt('end_time', start);

    if (exclude) q = q.neq('id', exclude);

    const { data, error } = await q;
    if (error) throw error;

    const hasConflict = (data ?? []).length > 0;
    return NextResponse.json({ hasConflict });
  } catch (e: any) {
    const config = supabaseConfigErrorResponse(e);
    if (config) return config;
    return NextResponse.json({ hasConflict: false, error: String(e?.message || e) }, { status: 400 });
  }
}
