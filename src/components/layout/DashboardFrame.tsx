// src/components/layout/DashboardFrame.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import type { AppRole } from '@/lib/roles';

import SidebarProvider from '@/components/layout/SidebarProvider';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppHeader from '@/components/layout/AppHeader';

export default async function DashboardFrame({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (toAppRole(session?.user?.role) ?? 'CLIENT') as AppRole;
  const userLabel = (session?.user?.name ?? session?.user?.email ?? 'Utilizador') as string;

  return (
    <SidebarProvider>
      <div className="flex" style={{ minHeight: '100vh' }}>
        <aside style={{ width: 280, flex: '0 0 auto' }}>
          <RoleSidebar role={role} userLabel={userLabel} />
        </aside>
        <div className="flex-1 min-w-0">
          <AppHeader />
          <main className="p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
