import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function GET(req: NextRequest) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ items: [] }, { status: 401 });
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ items: [] }, { status: 403 });

  const sb = createServerClient();
  const target = req.nextUrl.searchParams.get('target') || undefined;
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('pageSize') || 10)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let q = sb.from('audit_log').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (target) q = q.eq('target_id', target);
    const { data, count } = await q;
    return NextResponse.json({ items: data ?? [], count: count ?? 0, page, pageSize });
  } catch {
    return NextResponse.json({ items: [], count: 0, page, pageSize });
  }
}
