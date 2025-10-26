import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { buildRateLimitHeaders, rateLimitRequest } from '@/lib/http/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const rate = rateLimitRequest(req, { limit: 120, windowMs: 60_000, prefix: 'notifications:badge' });
  const baseHeaders = buildRateLimitHeaders(rate);
  const headers = { ...baseHeaders, 'cache-control': 'no-store' } as Record<string, string>;
  if (!rate.ok) {
    return NextResponse.json({ count: 0, error: 'too_many_requests' }, { status: 429, headers });
  }

  const sb = createServerClient();
  try {
    const { data: auth } = await sb.auth.getUser();
    const uid = auth?.user?.id ?? null;

    // Se não autenticado, 0
    if (!uid) return NextResponse.json({ count: 0 }, { headers });

    // 1) notifications(user_id, read=false)
    let { count } = await sb
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('read', false);

    // 2) fallback: is_read = false
    if (!count) {
      const r2 = await sb
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('is_read', false);
      count = r2.count ?? count;
    }

    // 3) fallback: notifications_unread view
    if (!count) {
      const r3 = await sb.from('notifications_unread').select('id', { count: 'exact', head: true }).eq('user_id', uid);
      count = r3.count ?? count;
    }

    return NextResponse.json({ count: count ?? 0 }, { headers });
  } catch (e: any) {
    return NextResponse.json({ count: 0, error: e?.message ?? 'unknown' }, { status: 200, headers });
  }
}
