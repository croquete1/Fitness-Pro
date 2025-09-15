import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requirePtOrAdminGuard, isGuardErr } from '@/lib/api-guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SessionRow = {
  id: string;
  trainer_id: string | null;
  client_id: string | null;
  scheduled_at: string | null;
  duration_min: number | null;
  location: string | null;
  notes: string | null;
  created_at: string | null;
};

export async function GET(req: Request): Promise<Response> {
  const guard = await requirePtOrAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const url = new URL(req.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const trainerIdFilter = url.searchParams.get('trainerId'); // só admin usa

  const sb = createServerClient();
  let q = sb
    .from('sessions')
    .select('id,trainer_id,client_id,scheduled_at,duration_min,location,notes,created_at');

  if (guard.me.role === 'PT') {
    q = q.eq('trainer_id', guard.me.id);
  } else if (guard.me.role === 'ADMIN' && trainerIdFilter) {
    q = q.eq('trainer_id', trainerIdFilter);
  }

  if (from) q = q.gte('scheduled_at', new Date(from).toISOString());
  if (to) q = q.lte('scheduled_at', new Date(to).toISOString());

  const { data, error } = await q.order('scheduled_at', { ascending: true }).limit(100);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, items: (data ?? []) as SessionRow[] }, { status: 200 });
}
