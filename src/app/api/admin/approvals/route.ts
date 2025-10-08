import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') ?? '0');
  const pageSize = Math.min(Number(url.searchParams.get('pageSize') ?? '20'), 100);
  const q = (url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();

  const sb = createServerClient();

  async function base(table: string) {
    let sel = sb.from(table).select('*', { count: 'exact' });
    if (q) sel = sel.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    if (status) sel = sel.eq('status', status);
    const from = page * pageSize, to = from + pageSize - 1;
    return sel.range(from, to).order('created_at', { ascending: false }).order('id', { ascending: true });
  }

  let r = await base('approvals');
  if (!r.data && !r.error) r = await base('pending_approvals');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });

  return NextResponse.json({ rows: r.data ?? [], count: r.count ?? 0 });
}

export async function POST(req: Request) {
  const sb = createServerClient();
  const b = await req.json().catch(() => ({}));

  const payload = {
    user_id: b.user_id ?? b.uid ?? null,
    name: b.name ?? null,
    email: b.email ?? null,
    status: b.status ?? 'pending',
  };
  const ins = async (table: string) => sb.from(table).insert(payload).select('*').single();
  let r = await ins('approvals'); if (r.error?.code === '42P01') r = await ins('pending_approvals');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  return NextResponse.json({ ok: true, row: r.data });
}
