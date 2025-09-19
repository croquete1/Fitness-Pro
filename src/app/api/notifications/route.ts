import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function GET(req: NextRequest) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ items: [], count: 0, page: 1, pageSize: 10 }, { status: 401 });

  const sb = createServerClient();
  const userId = session.user.id;

  // compat com versão anterior
  const unreadParam = req.nextUrl.searchParams.get('unread');
  const status = (req.nextUrl.searchParams.get('status') || (unreadParam === '1' ? 'unread' : 'all')).toLowerCase() as
    | 'all' | 'unread' | 'read';

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('pageSize') || 10)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let q = sb.from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status === 'unread') q = q.eq('read', false);
    if (status === 'read') q = q.eq('read', true);

    const { data, count } = await q;

    const items = (data ?? []).map((n: any) => ({
      id: n.id,
      title: n.title ?? n.head ?? 'Notificação',
      body: n.body ?? n.text ?? '',
      href: n.href ?? n.url ?? '/dashboard/notifications',
      read: !!n.read,
      created_at: n.created_at ?? null,
    }));

    return NextResponse.json({ items, count: count ?? 0, page, pageSize });
  } catch {
    return NextResponse.json({ items: [], count: 0, page, pageSize });
  }
}
