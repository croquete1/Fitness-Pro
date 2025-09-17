// src/components/layout/DashboardFrame.tsx
'use client';

import * as React from 'react';
import type { AppRole } from '@/lib/roles';
import { SidebarProvider } from '@/components/layout/SidebarProvider';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppHeader from '@/components/layout/AppHeader';
import SidebarHoverPeeker from '@/components/layout/SidebarHoverPeeker';

export default function DashboardFrame({
  role,
  userLabel,
  children,
}: {
  role: AppRole;
  userLabel: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen grid lg:grid-cols-[auto_1fr]">
        {/* Sidebar única, delegada pelo role */}
        <RoleSidebar role={role} userLabel={userLabel} />

        {/* Main */}
        <div className="min-w-0">
          <AppHeader />
          <main className="p-3 sm:p-5">{children}</main>
        </div>
      </div>

      {/* hotspot de hover para expandir quando colapsada */}
      <SidebarHoverPeeker />
    </SidebarProvider>
  );
}
