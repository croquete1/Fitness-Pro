// src/app/api/notifications/dropdown/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ items: [], unread: 0 });

  const sb = createServerClient();

  // últimas 20 não lidas (se não houver, últimas 10 recentes)
  const { data: unreadRows } = await sb
    .from('notifications')
    .select('id,title,body,href,created_at,read')
    .eq('user_id', uid)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(20);

  let items = (unreadRows || []).map((r: any) => ({
    id: r.id,
    title: r.title || 'Notificação',
    sub: r.body || '',
    href: r.href ?? null,
    read: !!r.read,
    created_at: r.created_at,
  }));

  if (items.length === 0) {
    const { data: recent } = await sb
      .from('notifications')
      .select('id,title,body,href,created_at,read')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10);
    items = (recent || []).map((r: any) => ({
      id: r.id,
      title: r.title || 'Notificação',
      sub: r.body || '',
      href: r.href ?? null,
      read: !!r.read,
      created_at: r.created_at,
    }));
  }

  const { count: unread } = await sb
    .from('notifications')
    .select('*', { head: true, count: 'exact' })
    .eq('user_id', uid)
    .eq('read', false);

  return NextResponse.json({ items, unread: unread ?? 0 });
}
