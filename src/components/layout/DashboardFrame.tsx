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
  userLabel: _userLabel, // mantemos para compatibilidade com chamadas existentes
  children,
}: {
  role: AppRole;
  userLabel: string;
  children: React.ReactNode;
}) {
  // marcar como usado para evitar lint no-unused-vars em configs mais estritas
  void _userLabel;

  const handleNavigate = React.useCallback(() => {
    // Aqui poderias fechar o menu mobile, se o provider expuser essa API.
  }, []);

  return (
    <SidebarProvider>
      <div className="fp-shell" data-auth-root>
        <RoleSidebar role={role} onNavigate={handleNavigate} />
        <div className="fp-main">
          <AppHeader />
          <main className="fp-content">{children}</main>
        </div>
      </div>

      {/* Zona “hotspot” que abre a sidebar quando está colapsada e não afixada */}
      <SidebarHoverPeeker />
    </SidebarProvider>
  );
}
