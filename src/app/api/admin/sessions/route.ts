import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || new Date().toISOString();
  const to = searchParams.get('to') || new Date(Date.now() + 7 * 864e5).toISOString();
  const trainerId = searchParams.get('trainer_id') || '';

  let query = sb
    .from('sessions')
    .select(`
      id, start_at, status, notes,
      trainer:trainer_id ( id, name, email ),
      client:client_id ( id, name, email )
    `)
    .gte('start_at', from)
    .lte('start_at', to)
    .order('start_at', { ascending: true });

  if (trainerId) query = query.eq('trainer_id', trainerId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // trainers para dropdown
  const { data: trainers } = await sb.from('users').select('id, name, email, role').eq('role', 'PT');

  return NextResponse.json({ rows: data ?? [], trainers: trainers ?? [] });
}
