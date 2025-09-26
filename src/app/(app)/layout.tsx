'use client';

import SidebarProvider from '@/components/layout/SidebarProvider';

export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
