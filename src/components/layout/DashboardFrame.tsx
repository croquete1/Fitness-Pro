// src/components/layout/DashboardFrame.tsx
'use client';

import * as React from 'react';
import type { AppRole } from '@/lib/roles';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarProvider';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppHeader from '@/components/layout/AppHeader';
import SidebarHoverPeeker from '@/components/layout/SidebarHoverPeeker';

function Inner({
  role,
  userLabel,
  children,
}: {
  role: AppRole;
  userLabel: string;
  children: React.ReactNode;
}) {
  const { collapsed, peek } = useSidebar();
  const width = collapsed && !peek ? 72 : 260;

  return (
    <div
      className="min-h-screen lg:grid lg:grid-cols-[var(--sb-w)_1fr] transition-[grid-template-columns] duration-200 ease-out"
      style={{ ['--sb-w' as any]: `${width}px` }}
    >
      {/* Sidebar delegada por role (única) */}
      <RoleSidebar role={role} userLabel={userLabel} />

      {/* Coluna principal */}
      <div className="min-w-0 flex flex-col">
        <AppHeader />
        <main className="p-3 sm:p-5">{children}</main>
      </div>

      {/* Hotspot para “espreitar” quando colapsada */}
      <SidebarHoverPeeker />
    </div>
  );
}

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
      <Inner role={role} userLabel={userLabel}>
        {children}
      </Inner>
    </SidebarProvider>
  );
}
