import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'PT' | 'TRAINER' | 'CLIENT' | string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | string;
  created_at: string | null;
};

export async function GET(req: Request): Promise<Response> {
  // Apenas ADMIN pode pesquisar utilizadores (ajusta se quiseres abrir a PT)
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const role = (url.searchParams.get('role') || '').trim().toUpperCase();
  const status = (url.searchParams.get('status') || '').trim().toUpperCase();

  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || '20')));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const sb = createServerClient();

  // Seleção com count para paginação
  let qb = sb
    .from('users')
    .select('id,name,email,role,status,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // Filtro de pesquisa (nome OU email)
  if (q) {
    // cuidado com vírgulas na sintaxe do .or()
    const safe = q.replace(/,/g, '\\,');
    qb = qb.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  if (role) qb = qb.eq('role', role);
  if (status) qb = qb.eq('status', status);

  const { data, error, count } = await qb;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      total: count ?? 0,
      items: (data ?? []) as UserRow[],
      page,
      pageSize,
    },
    { status: 200 }
  );
}
