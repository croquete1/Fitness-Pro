// Layout wrapper do grupo (app)
import * as React from 'react';
import SidebarProvider from '@/components/layout/SidebarProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
