// GET /api/notifications?unread=1&limit=10
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function GET(req: NextRequest) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ items: [] }, { status: 401 });
  const userId = session.user.id;

  const limit = Number(req.nextUrl.searchParams.get('limit') || 10);
  const unreadOnly = req.nextUrl.searchParams.get('unread') === '1';

  const sb = createServerClient();
  try {
    let sel = sb.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (unreadOnly) sel = sel.eq('read', false);
    const { data } = await sel;

    const items = (data ?? []).map((n: any) => ({
      id: n.id,
      title: n.title ?? n.head ?? 'Notificação',
      body: n.body ?? n.text ?? '',
      href: n.href ?? n.url ?? '/dashboard/notifications',
      read: !!n.read,
      created_at: n.created_at ?? null,
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
