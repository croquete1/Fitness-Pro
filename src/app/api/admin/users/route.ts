import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

export async function GET(req: Request): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? '20')));
  const role = url.searchParams.get('role') ?? undefined;
  const status = url.searchParams.get('status') ?? undefined;

  const sb = createServerClient();

  let q = sb.from('users')
    .select('id, name, email, role, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (role) q = q.eq('role', role);
  if (status) q = q.eq('status', status);

  const { data, error, count } = await q;

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({
    ok: true,
    items: data ?? [],
    pagination: { page, pageSize, total: count ?? 0 }
  });
}
