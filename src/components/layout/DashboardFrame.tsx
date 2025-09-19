'use client';

import * as React from 'react';
import { useSidebar } from '@/components/layout/SidebarProvider';
import AppHeader from '@/components/layout/AppHeader';
import RoleSidebar from '@/components/layout/RoleSidebar';
import type { AppRole } from '@/lib/roles';

export default function DashboardFrame({
  role,
  userLabel,
  children,
}: {
  role: AppRole;
  userLabel?: string;
  children: React.ReactNode;
}) {
  const { collapsed, peek } = useSidebar();       // << agora existe
  const width = collapsed && !peek ? 72 : 260;    // largura efetiva da sidebar

  return (
    <div className="fp-shell" data-auth-root style={{ display: 'grid', gridTemplateColumns: `${width}px 1fr`, minHeight: '100dvh' }}>
      <RoleSidebar role={role} userLabel={userLabel} />
      <div className="fp-main" style={{ minWidth: 0, display: 'grid', gridTemplateRows: 'auto 1fr' }}>
        <AppHeader />
        <main className="fp-content" style={{ padding: 16, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
