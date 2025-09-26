'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { useSidebar } from './SidebarProvider';

/**
 * Wrapper seguro para páginas antigas.
 * Se precisares de margem à esquerda, usamos os widths do contexto;
 * mas como a nova shell em grid já reserva a coluna, deixo sem ml para evitar “dupla” margem.
 */
export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isMobile, collapsed, railWidth, panelWidth } = useSidebar();
  const _left = isMobile ? 0 : (collapsed ? railWidth : panelWidth); // disponível se quiseres usar

  return (
    <Box component="main" sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
      {children}
    </Box>
  );
}
