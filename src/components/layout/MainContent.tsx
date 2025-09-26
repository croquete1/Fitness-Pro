'use client';

import * as React from 'react';
import { useSidebar } from '@/components/layout/SidebarProvider';

export default function MainContent({ children }: { children: React.ReactNode }) {
  // agora o contexto expõe isMobile e open (alias de mobileOpen)
  const { collapsed, isMobile, railWidth, panelWidth } = useSidebar();

  // largura efetiva da sidebar (0 no mobile)
  const asideWidth = isMobile ? 0 : (collapsed ? railWidth : panelWidth);

  // Se usares CSS custom que leia --aside-w, mantemos essa variável disponível:
  return (
    <div
      className="fp-content"
      style={{ '--aside-w': `${asideWidth}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
