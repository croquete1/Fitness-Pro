// src/components/layout/SidebarHoverPeeker.tsx
'use client';

import React from 'react';
import { useSidebar } from './SidebarProvider';

export default function SidebarHoverPeeker() {
  const { pinned, collapsed } = useSidebar();

  // Só precisamos do peeker quando NÃO estiver afixada.
  if (pinned) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: collapsed ? 20 : 0, // “borda” clicável quando colapsada
        height: '100vh',
        zIndex: 59,
        pointerEvents: collapsed ? 'auto' : 'none',
      }}
    />
  );
}
