'use client';

import * as React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { NeoFlexShell } from '@/components/layout/NeoFlexShell';

/**
 * Casca comum para o dashboard: sidebar (vinda por props) + AppHeader + conteúdo.
 */
export default function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <NeoFlexShell>
      {/* Sidebar (controla colapso/drawer internamente) */}
      {sidebar}

      {/* Conteúdo */}
      <div className="neo-flex-shell__main">
        <AppHeader />
        <div className="neo-flex-shell__content">{children}</div>
      </div>
    </NeoFlexShell>
  );
}
