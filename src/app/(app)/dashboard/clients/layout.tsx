import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import SidebarClientHydrated from '@/components/layout/SidebarClientHydrated';

async function getClientCounts() {
  const sb = createServerClient();

  let uid: string | null = null;
  try {
    const { data: auth } = await sb.auth.getUser();
    uid = auth?.user?.id ?? null;
  } catch {
    uid = null;
  }

  if (!uid) return { messagesCount: 0, notificationsCount: 0 };

  let messagesCount = 0;
  try {
    const m1 = await sb.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_id', uid).eq('read', false);
    messagesCount = m1.count ?? messagesCount;

    if (!messagesCount) {
      const m2 = await sb.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_id', uid).eq('is_read', false);
      messagesCount = m2.count ?? messagesCount;
    }
    if (!messagesCount) {
      const m3 = await sb.from('messages_unread').select('id', { count: 'exact', head: true }).eq('recipient_id', uid);
      messagesCount = m3.count ?? messagesCount;
    }
  } catch {}

  let notificationsCount = 0;
  try {
    const n1 = await sb.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('read', false);
    notificationsCount = n1.count ?? notificationsCount;

    if (!notificationsCount) {
      const n2 = await sb.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_read', false);
      notificationsCount = n2.count ?? notificationsCount;
    }
    if (!notificationsCount) {
      const n3 = await sb.from('notifications_unread').select('id', { count: 'exact', head: true }).eq('user_id', uid);
      notificationsCount = n3.count ?? notificationsCount;
    }
  } catch {}

  return { messagesCount: messagesCount || 0, notificationsCount: notificationsCount || 0 };
}

export default async function SectionLayout({ children }: { children: React.ReactNode }) {
  const initial = await getClientCounts();

  return (
    <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', minHeight:'100dvh' }}>
      {/* Híbrido: SSR + refresh no cliente */}
      <SidebarClientHydrated initial={initial} />
      <main style={{ minWidth: 0 }}>{children}</main>
    </div>
  );
}
