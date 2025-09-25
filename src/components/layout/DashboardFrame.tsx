'use client';

import * as React from 'react';
import { SidebarProvider } from './SidebarContext';
import RoleSidebar from '@/components/layout/RoleSidebar'; // já existente no teu projeto
import AppHeader from '@/components/layout/AppHeader';       // já existente no teu projeto

export default function DashboardFrame({
  role,
  userLabel,
  children,
}: {
  role: 'ADMIN' | 'PT' | 'CLIENT' | string;
  userLabel?: string | null;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] bg-neutral-50 dark:bg-neutral-950">
        {/* Sidebar lateral */}
        <RoleSidebar role={role} userLabel={userLabel ?? undefined} />

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 flex flex-col">
          <AppHeader />
          <main className="flex-1 min-w-0 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
