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

/**
 * Moldura base da app (Header + Sidebar + Conteúdo)
 * - Desktop: grid com coluna da sidebar (colapsável) + conteúdo
 * - Mobile: a sidebar vira Drawer (coluna única para o conteúdo)
 */
export default function DashboardFrame({ role = 'CLIENT', userLabel, children }: Props) {
  const { collapsed, isMobile, railWidth, panelWidth } = useSidebar();

  // No mobile a sidebar é Drawer, por isso a grelha tem só 1 coluna
  const gridCols = isMobile ? '1fr' : `${collapsed ? railWidth : panelWidth}px 1fr`;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      {/* Header (sticky) */}
      <AppHeader role={role} userLabel={userLabel ?? undefined} />

      {/* Corpo: Sidebar + Conteúdo (ou só Conteúdo no mobile) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          transition: 'grid-template-columns .26s var(--sb-ease, cubic-bezier(.18,.9,.22,1))',
          minHeight: 0,
        }}
      >
        {/* Sidebar fixa no desktop — no mobile, o próprio RoleSidebar troca para Drawer */}
        {!isMobile && <RoleSidebar role={role} userLabel={userLabel ?? undefined} />}
        {isMobile && (
          // Mount para garantir que o Drawer existe no DOM (RoleSidebar lida com open/close)
          <RoleSidebar role={role} userLabel={userLabel ?? undefined} />
        )}

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
