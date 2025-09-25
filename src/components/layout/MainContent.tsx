'use client';

import React from 'react';
import { useSidebar } from '@/components/layout/SidebarContext';

const RAIL_WIDTH = 72;   // sidebar colapsada
const PANEL_WIDTH = 240; // sidebar expandida

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { pinned, collapsed, isMobile, open } = useSidebar();

  // largura efetiva da sidebar à esquerda
  const asideWidth = isMobile ? 0 : (collapsed ? RAIL_WIDTH : PANEL_WIDTH);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        // se a sidebar estiver pinada em desktop, empurramos o conteúdo
        marginLeft: pinned && !isMobile ? asideWidth : 0,
        transition: 'margin-left .2s ease',
      }}
    >
      {children}
    </div>
  );
}
