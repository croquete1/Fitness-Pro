// src/app/(app)/layout.tsx
import type { ReactNode } from 'react';
import SidebarProvider from '@/components/layout/SidebarProvider';

export default function AppSectionLayout({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
