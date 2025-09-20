import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import NotificationsClient, { type Row } from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sessionUser = await getSessionUserSafe();
  const id = sessionUser?.user?.id;
  if (!id) redirect('/login');

  const sb = createServerClient();
  const { data } = await sb
    .from('notifications')
    .select('id,title,body,href,read,created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  const rows: Row[] = (data ?? []).map((n: any) => ({
    id: n.id,
    title: n.title ?? null,
    body: n.body ?? null,
    href: n.href ?? null,
    read: !!n.read,
    created_at: n.created_at ?? null,
  }));

  return <NotificationsClient rows={rows} />;
}
