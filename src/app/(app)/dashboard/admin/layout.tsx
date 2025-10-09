// src/app/(app)/dashboard/admin/layout.tsx
import * as React from 'react';
import { HeaderCountsProvider } from '@/components/header/HeaderCountsContext';
import DashboardFrame from '@/components/layout/DashboardFrame';
import SidebarAdminHydrated from '@/components/layout/SidebarAdminHydrated';

// Assumo que calculas `initialAdmin` via fetch server-side (SSR) com { approvalsCount, notificationsCount }
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const initialAdmin = {
    approvalsCount: 0,
    notificationsCount: 0,
    // podes acrescentar messagesCount se quiseres
  };

  return (
    <HeaderCountsProvider
      role="ADMIN"
      initial={{
        approvalsCount: initialAdmin.approvalsCount ?? 0,
        notificationsCount: initialAdmin.notificationsCount ?? 0,
        messagesCount: 0,
      }}
    >
      <DashboardFrame>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', minHeight: '100dvh' }}>
          <SidebarAdminHydrated initial={initialAdmin} />
          <main style={{ minWidth: 0 }}>{children}</main>
        </div>
      </DashboardFrame>
    </HeaderCountsProvider>
  );
}
