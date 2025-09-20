import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ items: [], total: 0 });

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'all') as 'all' | 'unread' | 'read';
  const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const sb = createServerClient();

  let q = sb
    .from('notifications')
    .select('id,title,body,href,read,created_at', { count: 'exact' })
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status === 'unread') q = q.eq('read', false);
  if (status === 'read') q = q.eq('read', true);

  const { data, count } = await q;
  const items = (data ?? []).map((n: any) => ({
    id: n.id as string,
    title: (n.title ?? null) as string | null,
    body: (n.body ?? null) as string | null,
    href: (n.href ?? null) as string | null,
    read: !!n.read,
    created_at: (n.created_at ?? null) as string | null,
  }));

  return NextResponse.json({ items, total: count ?? 0 });
}
