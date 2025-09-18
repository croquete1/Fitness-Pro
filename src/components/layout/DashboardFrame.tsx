// src/components/layout/DashboardFrame.tsx
'use client';

import * as React from 'react';
import type { AppRole } from '@/lib/roles';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarProvider';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppHeader from '@/components/layout/AppHeader';
import SidebarHoverPeeker from '@/components/layout/SidebarHoverPeeker';

function FrameInner({
  role,
  userLabel,
  children,
}: {
  role: AppRole;
  userLabel: string;
  children: React.ReactNode;
}) {
  const { collapsed, peek } = useSidebar();
  const sbw = collapsed && !peek ? 72 : 260; // largura dinâmica

  return (
    <div
      className="min-h-screen lg:grid lg:grid-cols-[var(--sb-w)_1fr]"
      style={{ ['--sb-w' as any]: `${sbw}px` }}
    >
      {/* Sidebar ÚNICA (delegada por role) */}
      <RoleSidebar role={role} userLabel={userLabel} />

      {/* Coluna principal */}
      <div className="min-w-0 flex flex-col">
        <AppHeader />
        <main className="p-3 sm:p-5">{children}</main>
      </div>
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
      <FrameInner role={role} userLabel={userLabel}>{children}</FrameInner>
      <SidebarHoverPeeker />
    </SidebarProvider>
  );
}
