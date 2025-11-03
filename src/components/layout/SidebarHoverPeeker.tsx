// src/components/layout/SidebarHoverPeeker.tsx
'use client';

import * as React from 'react';
import { useSidebar } from './SidebarProvider';

/**
 * Mostra uma “zona quente” de 12px na margem esquerda quando a sidebar está colapsada
 * (apenas desktop). Ao pairar, ativa o `peek` no contexto — útil para animares/expanderes
 * a rail temporariamente via CSS ou lógica na SidebarBase.
 */
export default function SidebarHoverPeeker() {
  const { isMobile, collapsed, setPeek } = useSidebar();

  if (isMobile || !collapsed) return null;

  return (
    <div
      aria-hidden
      className="neo-sidebar-peeker"
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
    />
  );
}
