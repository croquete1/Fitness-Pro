'use client';
import * as React from 'react';
import { Box, Container } from '@mui/material';
import AppHeader from '@/components/layout/AppHeader';
import RoleSidebar from '@/components/layout/RoleSidebar';
import type { AdminCounts, ClientCounts } from '@/lib/hooks/useCounts';

type Props = {
  role?: string | null;
  userLabel?: string | null;
  initialCounts?: { admin?: AdminCounts; client?: ClientCounts };
  children: React.ReactNode;
};

export default function DashboardFrame({ role, userLabel, initialCounts, children }: Props) {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <AppHeader userLabel={userLabel ?? undefined} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: 0,
        }}
      >
        <Box component="aside" sx={{ display: { xs: 'none', md: 'block' } }}>
          <RoleSidebar role={role} initialCounts={initialCounts} />
        </Box>

        <Box component="main" sx={{ p: 2 }}>
          <Container maxWidth="lg" disableGutters>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
