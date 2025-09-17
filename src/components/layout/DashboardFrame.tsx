'use client';

import React from 'react';
import RoleSidebar from './RoleSidebar';
import AppHeader from './AppHeader';
import { useSidebar } from './SidebarCtx';
import type { AppRole } from '@/lib/roles';

export default function DashboardFrame({
  role,
  userLabel,
  children,
}: {
  role: AppRole;
  userLabel: string;
  children: React.ReactNode;
}) {
  // Touch context here to guarantee provider está ativo (evita o teu erro de runtime)
  useSidebar();

  return (
    <div className="fp-shell">
      <div className="fp-sb-overlay" />
      <RoleSidebar role={role} userLabel={userLabel} />
      <div className="fp-content">
        <AppHeader />
        <main className="fp-main">{children}</main>
      </div>
    </div>
  );
}
