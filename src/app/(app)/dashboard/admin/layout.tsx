import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import SidebarAdminHydrated from '@/components/layout/SidebarAdminHydrated';

async function getAdminCounts() {
  const sb = createServerClient();

  // ---------- Aprovações pendentes (fallbacks) ----------
  let approvalsCount = 0;
  try {
    const r1 = await sb.from('users').select('id', { count: 'exact', head: true }).eq('approved', false);
    approvalsCount = r1.count ?? approvalsCount;
  } catch {}
  if (!approvalsCount) {
    try {
      const r2 = await sb.from('users').select('id', { count: 'exact', head: true }).eq('is_approved', false);
      approvalsCount = r2.count ?? approvalsCount;
    } catch {}
  }
  if (!approvalsCount) {
    try {
      const r3 = await sb.from('approvals').select('id', { count: 'exact', head: true }).eq('status', 'pending');
      approvalsCount = r3.count ?? approvalsCount;
    } catch {}
  }

  // ---------- Notificações por ler (user atual) ----------
  let notificationsCount = 0;
  try {
    const { data: auth } = await sb.auth.getUser();
    const uid = auth?.user?.id ?? null;
    if (uid) {
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
    }
  } catch {}

  return { approvalsCount: approvalsCount || 0, notificationsCount: notificationsCount || 0 };
}

export default async function SectionLayout({ children }: { children: React.ReactNode }) {
  const initial = await getAdminCounts();

  return (
    <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', minHeight:'100dvh' }}>
      {/* Híbrido: SSR + refresh no cliente */}
      <SidebarAdminHydrated initial={initial} />
      <main style={{ minWidth: 0 }}>{children}</main>
    </div>
  );
}
