import { NextResponse } from 'next/server';
import { serverSB } from '@/lib/supabase/server';
import { readPageParams, rangeFor } from '@/app/api/_utils/pagination';

export async function GET(req: Request) {
  try {
    const sb = serverSB();
    const { page, pageSize, q } = readPageParams(req);
    const { from, to } = rangeFor(page, pageSize);

    let query = sb.from('users')
      .select('id,name,email,role', { count: 'exact' })
      .eq('role', 'TRAINER');

    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    const rows = (data ?? []).map(u => ({ id: String(u.id), name: u.name ?? null, email: u.email ?? null }));
    return NextResponse.json({ rows, count: count ?? rows.length });
  } catch (e: any) {
    return NextResponse.json({ rows: [], count: 0, error: String(e?.message || e) }, { status: 500 });
  }
}
