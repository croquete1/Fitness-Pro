import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { buildRateLimitHeaders, rateLimitRequest } from '@/lib/http/rateLimit';

export async function POST(req: NextRequest) {
  const rate = rateLimitRequest(req, { limit: 60, windowMs: 60_000, prefix: 'notifications:mutate' });
  const rateHeaders = buildRateLimitHeaders(rate);
  const headers = { ...rateHeaders, 'cache-control': 'no-store' } as Record<string, string>;
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'too_many_requests' },
      { status: 429, headers },
    );
  }

  const session = await getSessionUserSafe();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers });

  let ids: string[] | undefined;
  try {
    const body = await req.json();
    if (Array.isArray(body?.ids) && body.ids.length) ids = body.ids;
  } catch {}

  const sb = createServerClient();
  let q = sb.from('notifications').update({ read: true }).eq('user_id', userId);
  if (ids) q = q.in('id', ids);
  const { data, error } = await q.select('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers });
  return NextResponse.json({ ok: true, count: data?.length ?? 0 }, { headers });
}
