import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requirePtOrAdminGuard, isGuardErr } from '@/lib/api-guards';

export async function GET(req: Request): Promise<Response> {
  const guard = await requirePtOrAdminGuard();
if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  const url = new URL(req.url);
  const trainerIdParam = url.searchParams.get('trainerId');

  // ADMIN pode ver de qualquer PT; PT vê apenas os seus
  const trainerId = guard.me.role === 'ADMIN' && trainerIdParam ? trainerIdParam : guard.me.id;

  // 1) ids
  const { data: links, error: e1 } = await sb
    .from('trainer_clients')
    .select('client_id')
    .eq('trainer_id', trainerId)
    .limit(2000);

  if (e1) return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });
  const ids = (links ?? []).map((x: any) => x.client_id);

  if (ids.length === 0) return NextResponse.json({ ok: true, items: [] });

  // 2) perfis/ users
  const { data: users, error: e2 } = await sb
    .from('users')
    .select('id, name, email, role, status, created_at')
    .in('id', ids)
    .order('created_at', { ascending: false });

  if (e2) return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });

  return NextResponse.json({ ok: true, items: users ?? [] });
}
