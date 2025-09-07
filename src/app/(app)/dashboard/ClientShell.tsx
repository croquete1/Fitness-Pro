'use client';

import React from 'react';
import type { AppRole } from '@/lib/roles';
import { SidebarProvider } from '@/components/layout/SidebarProvider';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppHeader from '@/components/layout/AppHeader';

export default function ClientShell({
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
      <div className="fp-shell">
        <RoleSidebar role={role} userLabel={userLabel} />
        <main className="fp-main">
          <AppHeader />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
