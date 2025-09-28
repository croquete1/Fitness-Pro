// layout raiz da área autenticada
import * as React from 'react';
import ColorModeProvider from '@/components/layout/ColorModeProvider';
import SidebarProvider from '@/components/layout/SidebarProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </ColorModeProvider>
  );
}
