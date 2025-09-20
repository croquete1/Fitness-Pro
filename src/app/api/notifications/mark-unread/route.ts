import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(req: NextRequest) {
  const session = await getSessionUserSafe();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let ids: string[] | undefined;
  try {
    const body = await req.json();
    if (Array.isArray(body?.ids) && body.ids.length) ids = body.ids;
  } catch {}

  const sb = createServerClient();
  let q = sb.from('notifications').update({ read: false }).eq('user_id', userId);
  if (ids) q = q.in('id', ids);
  const { data, error } = await q.select('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: data?.length ?? 0 });
}
