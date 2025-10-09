import { NextResponse } from 'next/server';
import { serverSB } from '@/lib/supabase/server';
import { supabaseConfigErrorResponse } from '@/lib/supabase/responses';

export async function GET(req: Request) {
  let sb;
  try {
    sb = serverSB();
  } catch (err) {
    const res = supabaseConfigErrorResponse(err);
    if (res) return res;
    throw err;
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const page = Number(searchParams.get('page') ?? '0');
  const pageSize = Number(searchParams.get('pageSize') ?? '20');
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = sb
    .from('users')
    .select('id,name,email', { count: 'exact' })
    .eq('role', 'TRAINER');

  if (q) {
    // procura em name/email (ajusta p/ as tuas colunas)
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((r: any) => ({
    id: String(r.id),
    name: r.name ?? null,
    email: r.email ?? null,
  }));

  return NextResponse.json({ rows, count: count ?? 0 });
}
