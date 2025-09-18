import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function GET(req: NextRequest) {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ items: [] }, { status: 200 });

  const sb = createServerClient();
  const unreadOnly = req.nextUrl.searchParams.get('unread') === '1';

  try {
    let q = sb.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50);
    if (unreadOnly) q = q.eq('read', false);
    const { data } = await q;
    return NextResponse.json({ items: data ?? [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  // marcar tudo como lido
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ ok: false }, { status: 200 });
  const sb = createServerClient();
  try {
    await sb.from('notifications').update({ read: true }).eq('user_id', uid).eq('read', false);
  } catch {}
  return NextResponse.json({ ok: true });
}
