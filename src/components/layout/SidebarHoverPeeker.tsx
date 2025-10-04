// src/components/layout/SidebarHoverPeeker.tsx
'use client';

import * as React from 'react';
import { Box } from '@mui/material';
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
    <Box
      aria-hidden
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 12,
        zIndex: 1200,
        // transparente e “não intrusivo”
        background: 'transparent',
        // permitir hover por cima de conteúdos
        pointerEvents: 'auto',
      }}
    />
  );
}
