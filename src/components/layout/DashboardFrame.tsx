// src/components/layout/DashboardFrame.tsx (exemplo)
'use client';

import React from 'react';
import SidebarAdmin from './SidebarAdmin';
import SidebarProvider from './SidebarProvider'; // default export também disponível
import AppHeader from './AppHeader';

export default function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex">
        <SidebarAdmin />
        <div className="flex-1 min-w-0">
          <AppHeader />
          <main className="p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}