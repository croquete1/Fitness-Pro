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

const RAIL_WIDTH = 64;   // sidebar colapsada
const PANEL_WIDTH = 260; // sidebar expandida

export default function DashboardFrame({ role = 'CLIENT', userLabel, children }: Props) {
  // ⚠️ só usamos chaves que realmente existem no SidebarCtx
  const { collapsed, isMobile } = useSidebar();

  // No mobile a sidebar é Drawer → 1 coluna; no desktop usamos as larguras locais
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
        {/* Sidebar fixa (desktop) ou Drawer (mobile) */}
        <RoleSidebar role={role} userLabel={userLabel ?? undefined} />

        {/* Conteúdo */}
        <Box component="main" sx={{ py: 3, minWidth: 0 }}>
          <Container maxWidth="xl">
            <Stack spacing={2}>{children}</Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
