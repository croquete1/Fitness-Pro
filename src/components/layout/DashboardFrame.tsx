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
      {/* Sidebar fixa */}
      <RoleSidebar role={role} userLabel={userLabel} />
      {/* Header + conteúdo compensados */}
      <div className="lg:pl-[260px]">
        <AppHeader />
        <main className="p-3 sm:p-5">{children}</main>
      </div>
      <SidebarHoverPeeker />
    </SidebarProvider>
  );
}
