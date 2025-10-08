import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import DashboardFrame from '@/components/layout/DashboardFrame';
import SidebarClientHydrated from '@/components/layout/SidebarClientHydrated';
import { HeaderCountsProvider } from '@/components/header/HeaderCountsContext';

async function safeCount(
  sb: ReturnType<typeof createServerClient>,
  table: string,
  where?: [string, string]
) {
  try {
    let q = sb.from(table).select('id', { count: 'exact', head: true });
    if (where) q = q.eq(where[0], where[1]);
    const { count = 0 } = await q;
    return count;
  } catch {
    return 0;
  }
}

export default async function SectionLayout({ children }: { children: React.ReactNode }) {
  const sb = createServerClient();

  const messagesCount =
    (await safeCount(sb, 'messages')) ||
    (await safeCount(sb, 'client_messages')) ||
    0;

  const notificationsCount =
    (await safeCount(sb, 'notifications', ['read', 'false'])) ||
    (await safeCount(sb, 'client_notifications', ['is_read', 'false'])) ||
    0;

  const initialClient = { messagesCount, notificationsCount };

  return (
    <HeaderCountsProvider role="CLIENT" initial={{ client: initialClient }}>
      <DashboardFrame>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', minHeight: '100dvh' }}>
          <SidebarClientHydrated initial={initialClient} />
          <main style={{ minWidth: 0 }}>{children}</main>
        </div>
      </DashboardFrame>
    </HeaderCountsProvider>
  );
}
