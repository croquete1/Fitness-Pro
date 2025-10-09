import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 0);
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? searchParams.get('perPage') ?? 20), 100);
  const q = searchParams.get('q') ?? searchParams.get('search') ?? undefined;
  const role = searchParams.get('role');
  const status = searchParams.get('status');

  const sb = createServerClient();
  let s = sb.from('users').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (q) s = s.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  if (role) s = s.eq('role', role);
  if (status) s = s.eq('status', status);

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await s.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = (data ?? []).map((row) => ({
    ...row,
    createdAt: row?.created_at ?? null,
  }));

  return NextResponse.json({ rows, count: count ?? rows.length });
}

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const body = await req.json().catch(() => ({}));
  const sb = createServerClient();

  const payload = {
    name: body.name ?? null,
    email: body.email ?? null,
    role: typeof body.role === 'string' ? body.role.toUpperCase() : 'CLIENT',
    status: typeof body.status === 'string' ? body.status.toUpperCase() : 'ACTIVE',
    approved: Boolean(body.approved ?? false),
    active: Boolean(body.active ?? true),
  };

  const { data, error } = await sb.from('users').insert(payload).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
