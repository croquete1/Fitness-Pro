import React from 'react';
import { SidebarProvider } from '@/components/SidebarWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
