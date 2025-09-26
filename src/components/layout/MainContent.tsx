'use client';

import * as React from 'react';
import { Box, Container } from '@mui/material';
import { useSidebar } from './SidebarProvider';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isMobile, collapsed, railWidth, panelWidth } = useSidebar();
  const left = isMobile ? 0 : (collapsed ? railWidth : panelWidth);

  return (
    <Box component="main" sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box sx={{ pl: { lg: `${left}px` }, transition: 'padding-left .25s ease' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
