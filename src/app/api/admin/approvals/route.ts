import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const limit = Number(url.searchParams.get('limit') || '20');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Pending = status 'PENDING' ou 'SUSPENDED' com meta de approval (ajusta à tua realidade)
  const q = sb.from('profiles')
    .select('id, full_name, email, role, status, created_at', { count: 'exact' })
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });

  const { data, error, count } = await q.range(from, to);
  if (error) return NextResponse.json([], { status: 400 });

  const items = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.full_name,
    email: r.email,
    requestedRole: r.role ?? 'CLIENT',
    status: r.status ?? 'PENDING',
    createdAt: r.created_at,
  }));

  const res = NextResponse.json(items);
  res.headers.set('x-total-count', String(count ?? items.length));
  return res;
}
