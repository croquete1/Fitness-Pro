import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import SidebarAdminHydrated from '@/components/layout/SidebarAdminHydrated';
import DashboardFrame from '@/components/layout/DashboardFrame';
import { HeaderCountsProvider } from '@/components/header/HeaderCountsContext';

async function countFallbacks(
  sb: ReturnType<typeof createServerClient>,
  variants: { table: string; col?: string; eq?: [string, string] }[]
) {
  for (const v of variants) {
    const q = sb.from(v.table).select(v.col ?? 'id', { count: 'exact', head: true });
    const res = v.eq ? await q.eq(v.eq[0], v.eq[1]) : await q;
    if (!res.error) return res.count ?? 0;
  }
  return 0;
}

export default async function SectionLayout({ children }: { children: React.ReactNode }) {
  const sb = createServerClient();

  const approvalsCount = await countFallbacks(sb, [
    { table: 'approvals', eq: ['status', 'pending'] },
    { table: 'user_approvals', eq: ['status', 'pending'] },
  ]);

  const notificationsCount = await countFallbacks(sb, [
    { table: 'notifications', eq: ['read', 'false'] },
    { table: 'admin_notifications', eq: ['is_read', 'false'] },
  ]);

  const initialAdmin = { approvalsCount, notificationsCount };

  return (
    <HeaderCountsProvider role="ADMIN" initial={{ admin: initialAdmin }}>
      <DashboardFrame>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', minHeight: '100dvh' }}>
          <SidebarAdminHydrated initial={initialAdmin} />
          <main style={{ minWidth: 0 }}>{children}</main>
        </div>
      </DashboardFrame>
    </HeaderCountsProvider>
  );
}
