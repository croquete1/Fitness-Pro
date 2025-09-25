import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ rows: [], total: 0 }, { status: 401 });

  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const perPage = Number(url.searchParams.get('perPage') || url.searchParams.get('limit') || '20');
  const search = (url.searchParams.get('search') || '').trim();
  const role = (url.searchParams.get('role') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const sort = (url.searchParams.get('sort') || 'desc').toLowerCase();

  let q = sb.from('profiles')
    .select('id, full_name, email, role, status, created_at', { count: 'exact' });

  if (search) {
    q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (role) q = q.eq('role', role);
  if (status) q = q.eq('status', status);

  q = q.order('created_at', { ascending: sort !== 'desc' });

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await q.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = (data ?? []).map(r => ({
    id: r.id,
    name: r.full_name,
    email: r.email,
    role: r.role,
    status: r.status,
    createdAt: r.created_at,
  }));

  // Compatibilidade: "users" (ApprovalsClient) e "rows" (UsersClient)
  const res = NextResponse.json({ rows, users: rows, total: count ?? rows.length });
  res.headers.set('x-total-count', String(count ?? rows.length));
  return res;
}

export async function PATCH(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));
  const id = String(body.id || '');
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  const patch: any = {};
  if (body.role) patch.role = String(body.role);
  if (body.status) patch.status = String(body.status);

  // 1ª tentativa: profiles
  let { error } = await sb.from('profiles').update(patch).eq('id', id);
  if (error) {
    // 2ª tentativa: users
    const r2 = await sb.from('users').update(patch).eq('id', id);
    if (r2.error) return NextResponse.json({ error: r2.error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
