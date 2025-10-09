import { NextResponse } from 'next/server';
import { serverSB } from '@/lib/supabase/server';

/**
 * GET /api/admin/pts-schedule/conflicts?start_time=...&end_time=...&trainer_id=...&client_id=...&exclude_id=...
 * Tabela usada: "sessions" (ajusta nomes de colunas se diferentes)
 */
export async function GET(req: Request) {
  const sb = serverSB();
  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start_time');
  const end = searchParams.get('end_time');
  const trainerId = searchParams.get('trainer_id');
  const clientId = searchParams.get('client_id');
  const excludeId = searchParams.get('exclude_id');

  if (!start || !end) {
    return NextResponse.json({ hasConflict: false });
  }

  // Sobreposição: (A.start < B.end) AND (B.start < A.end)
  let q = sb
    .from('sessions')
    .select('id,trainer_id,client_id,start_time,end_time', { count: 'exact' })
    .lt('start_time', end)
    .gt('end_time', start);

  if (trainerId) q = q.eq('trainer_id', trainerId);
  if (clientId)  q = q.eq('client_id', clientId);
  if (excludeId) q = q.neq('id', excludeId);

  const { count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ hasConflict: (count ?? 0) > 0 });
}
