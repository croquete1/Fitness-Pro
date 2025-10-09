import { NextResponse } from 'next/server';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson } from '@/lib/supabase/responses';

export async function GET(req: Request) {
  const sb = tryGetSBC();
  if (!sb) return supabaseFallbackJson({ rows: [], count: 0 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const page = Number(searchParams.get('page') ?? '0');
  const pageSize = Number(searchParams.get('pageSize') ?? '20');
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = sb
    .from('users')
    .select('id,name,email', { count: 'exact' })
    .in('role', ['TRAINER', 'PT']);

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
