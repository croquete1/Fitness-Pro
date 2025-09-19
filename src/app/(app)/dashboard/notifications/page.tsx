export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import NotificationsListClient from '@/components/notifications/NotificationsListClient';

export default async function NotificationsPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const sb = createServerClient();

  const { data } = await sb
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const items = (data ?? []).map((n: any) => ({
    id: n.id,
    title: n.title ?? n.head ?? 'Notificação',
    body: n.body ?? n.text ?? '',
    href: n.href ?? n.url ?? '/dashboard/notifications',
    read: !!n.read,
    created_at: n.created_at ?? null,
  }));

  return <NotificationsListClient initial={items} />;
}
