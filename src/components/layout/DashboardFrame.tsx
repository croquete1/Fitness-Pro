// src/components/layout/DashboardFrame.tsx
'use client';

import * as React from 'react';
import { Box, Container, Stack } from '@mui/material';
import AppHeader from './AppHeader';
import RoleSidebar from './RoleSidebar';
import { useSidebar } from './SidebarProvider';
import SidebarHoverPeeker from './SidebarHoverPeeker';

type Props = {
  role?: string;
  userLabel?: string | null | undefined;
  children: React.ReactNode;
};

export default function DashboardFrame({ role = 'CLIENT', userLabel, children }: Props) {
  const { collapsed, isMobile, widthCollapsed, widthExpanded } = useSidebar();

  // No mobile a sidebar é um Drawer → 1 coluna; no desktop usamos as larguras do Provider
  const gridCols = isMobile ? '1fr' : `${collapsed ? widthCollapsed : widthExpanded}px 1fr`;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      {/* Header global (pesquisa, tema, conta) */}
      <AppHeader role={role} userLabel={userLabel ?? undefined} />

      {/* Shell com Sidebar + Main */}
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

      {/* “Peek on hover” — fica fora do Drawer e só ativa no desktop colapsado */}
      <SidebarHoverPeeker />
    </Box>
  );
}
