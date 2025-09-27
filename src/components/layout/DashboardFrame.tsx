// src/components/layout/DashboardFrame.tsx
'use client';

import * as React from 'react';
import { Box, Container, Stack } from '@mui/material';
import AppHeader from './AppHeader';
import RoleSidebar from './RoleSidebar';
import { useSidebar } from './SidebarProvider';

type Props = {
  role?: string;
  userLabel?: string | null | undefined;
  children: React.ReactNode;
};

const RAIL_WIDTH = 64;   // colapsada (alinha com --sb-collapsed)
const PANEL_WIDTH = 260; // expandida (alinha com --sb-expanded)

export default function DashboardFrame({ role = 'CLIENT', userLabel, children }: Props) {
  const { collapsed, isMobile } = useSidebar();

  // No mobile a sidebar é um Drawer → 1 coluna
  const gridCols = isMobile ? '1fr' : `${collapsed ? RAIL_WIDTH : PANEL_WIDTH}px 1fr`;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <AppHeader role={role} userLabel={userLabel ?? undefined} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          transition: 'grid-template-columns .26s cubic-bezier(.18,.9,.22,1)',
          minHeight: 0,
        }}
      >
        {/* Sidebar fixa no desktop ou Drawer no mobile */}
        <RoleSidebar role={role} userLabel={userLabel ?? undefined} />

        {/* Content */}
        <Box component="main" sx={{ py: 3, minWidth: 0 }}>
          <Container maxWidth="xl">
            <Stack spacing={2}>{children}</Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
