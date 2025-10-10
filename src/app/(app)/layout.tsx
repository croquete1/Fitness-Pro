// src/app/(app)/layout.tsx
// Layout raiz da área autenticada (Server Component)
import * as React from 'react';
import SidebarProvider from '@/components/layout/SidebarProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
