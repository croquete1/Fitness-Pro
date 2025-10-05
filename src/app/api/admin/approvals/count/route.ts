import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = createServerClient();

  try {
    // Caso mais comum: utilizadores por aprovar
    // 1) users.approved = false
    let { count, error } = await sb.from('users').select('id', { count: 'exact', head: true }).eq('approved', false);

    // 2) fallback: users.is_approved = false
    if (!count && !error) {
      const r2 = await sb.from('users').select('id', { count: 'exact', head: true }).eq('is_approved', false);
      count = r2.count ?? count;
    }

    // 3) fallback alternativo: approvals table (status = 'pending')
    if (!count && !error) {
      const r3 = await sb.from('approvals').select('id', { count: 'exact', head: true }).eq('status', 'pending');
      count = r3.count ?? count;
    }

    return NextResponse.json({ count: count ?? 0 }, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ count: 0, error: e?.message ?? 'unknown' }, { status: 200, headers: { 'cache-control': 'no-store' } });
  }
}
