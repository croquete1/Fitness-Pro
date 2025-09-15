import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

export async function GET(req: Request): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const url = new URL(req.url);
  const trainerId = url.searchParams.get('trainerId');

  const sb = createServerClient();
  let q = sb.from('trainer_clients').select('id, trainer_id, client_id, created_at').order('created_at', { ascending: false });
  if (trainerId) q = q.eq('trainer_id', trainerId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data ?? [] });
}
