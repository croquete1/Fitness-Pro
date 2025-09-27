// src/components/layout/MainContent.tsx
'use client';

import * as React from 'react';
import { Box, Container, Stack } from '@mui/material';

type Props = {
  children: React.ReactNode;
  /** Ajusta facilmente o content width da página */
  maxWidth?: 'xl' | 'lg' | 'md' | 'sm' | false;
  /** Útil para páginas full-bleed (grids, etc.) */
  disableGutters?: boolean;
  /** Espaçamento vertical entre blocos */
  spacing?: number;
};

export default function MainContent({
  children,
  maxWidth = 'xl',
  disableGutters = false,
  spacing = 2,
}: Props) {
  return (
    <Box component="main" sx={{ py: 3, minWidth: 0 }}>
      <Container maxWidth={maxWidth} disableGutters={disableGutters}>
        <Stack spacing={spacing}>{children}</Stack>
      </Container>
    </Box>
  );
}
