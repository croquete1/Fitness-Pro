'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import AppHeader from '@/components/layout/AppHeader';

/**
 * Casca comum para o dashboard: sidebar (vinda por props) + AppHeader + conteúdo.
 */
export default function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {/* Sidebar (controla colapso/drawer internamente) */}
      {sidebar}

      {/* Conteúdo */}
      <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Box component="div" sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
}
