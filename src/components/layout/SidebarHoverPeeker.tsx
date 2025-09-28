'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { useSidebar } from './SidebarProvider';

/**
 * Tira partido do “peek” ao passar o rato junto à margem esquerda quando a sidebar
 * está colapsada no desktop. No mobile não renderiza.
 */
export default function SidebarHoverPeeker() {
  const { isMobile, collapsed, setPeek } = useSidebar();

  if (isMobile || !collapsed) return null;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 12,             // “zona quente”
        zIndex: 30,
        // invisível mas clicável para hover
        background: 'transparent',
      }}
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
    />
  );
}
