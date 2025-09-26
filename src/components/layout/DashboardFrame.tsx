// src/components/layout/DashboardFrame.tsx
'use client';

import * as React from 'react';
import { AppBar, Toolbar, Box, IconButton, Typography, Container, Stack, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

type Props = {
  role?: string;
  userLabel?: string | null | undefined;
  children: React.ReactNode;
};

export default function DashboardFrame({ role = 'CLIENT', userLabel, children }: Props) {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <AppBar position="sticky" color="inherit" sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton edge="start" size="large" sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={800}>Fitness Pro</Typography>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {role === 'ADMIN' ? '🛠️ Admin' : role === 'TRAINER' ? '🧑‍🏫 PT' : '💪 Cliente'}
            {userLabel ? ` • ${userLabel}` : ''}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ py: 3 }}>
        <Container maxWidth="xl">
          {/* Content wrapper para manter contraste */}
          <Stack spacing={2}>
            {/* Exemplo: podes remover este Paper se o teu conteúdo já traz Cards próprios */}
            <Paper sx={{ p: 2, display: { xs: 'block', md: 'none' } }}>
              <Typography variant="body2" color="text.secondary">
                Dica: usa o menu (☰) para navegar as secções.
              </Typography>
            </Paper>
            {children}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
