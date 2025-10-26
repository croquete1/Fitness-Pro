import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { buildRateLimitHeaders, rateLimitRequest } from '@/lib/http/rateLimit';

export async function POST(req: Request) {
  const rate = rateLimitRequest(req, { limit: 12, windowMs: 60_000, prefix: 'notifications:mutate-all' });
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

  const sb = createServerClient();
  const { data, error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .select('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers });
  return NextResponse.json({ ok: true, count: data?.length ?? 0 }, { headers });
}
