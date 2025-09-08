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
      <div className="fp-shell" data-auth-root>
        <RoleSidebar role={role} userLabel={userLabel} />
        <div className="fp-main">
          <AppHeader />
          <main className="fp-content">{children}</main>
        </div>
      </div>
      {/* Aumenta um pouco a “zona quente” do rail quando não está afixada (implementação segura/no-op) */}
      <SidebarHoverPeeker />
    </SidebarProvider>
  );
}
