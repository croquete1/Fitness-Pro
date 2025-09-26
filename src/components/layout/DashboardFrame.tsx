'use client';

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Container,
  Stack,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

// ⚙️ Contexto da sidebar (já existente no teu projeto)
import SidebarProvider from './SidebarProvider';
import { useSidebar } from './SidebarCtx';
import RoleSidebar from './RoleSidebar';

// ---- Tipos ---------------------------------------------------------------
type Props = {
  role?: 'ADMIN' | 'TRAINER' | 'CLIENT' | string;
  userLabel?: string | null | undefined;
  children: React.ReactNode;
};

// ---- Header que usa o contexto (toggle) ----------------------------------
function HeaderBar({ role = 'CLIENT', userLabel }: { role: Props['role']; userLabel?: Props['userLabel'] }) {
  const { toggle } = useSidebar();

  const roleLabel =
    role === 'ADMIN' ? '🛠️ Admin' :
    role === 'TRAINER' ? '🧑‍🏫 PT' :
    '💪 Cliente';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          size="large"
          onClick={toggle}
          aria-label="Alternar menu lateral"
          sx={{ mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={800}>
          Fitness Pro
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Typography variant="body2" color="text.secondary">
          {roleLabel}
          {userLabel ? ` • ${userLabel}` : ''}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

// ---- Overlay para mobile (fecha ao clicar) -------------------------------
function MobileOverlay() {
  const { mobileOpen, closeMobile } = useSidebar();
  return (
    <Box
      onClick={closeMobile}
      className="fp-sb-overlay"
      // Em CSS já controlamos a visibilidade via data-attrs;
      // aqui garantimos acessibilidade/tab-stop = não interativo quando fechado
      sx={{
        pointerEvents: mobileOpen ? 'auto' : 'none',
      }}
    />
  );
}

// ---- Frame principal -----------------------------------------------------
export default function DashboardFrame({ role = 'CLIENT', userLabel, children }: Props) {
  return (
    <SidebarProvider>
      <div className="fp-shell">
        {/* Sidebar por papel do utilizador */}
        <aside className="fp-sidebar">
          <RoleSidebar role={role as any} />
        </aside>

        {/* Conteúdo */}
        <main className="fp-main">
          <HeaderBar role={role} userLabel={userLabel} />

          <Box component="section" sx={{ py: 3 }}>
            <Container maxWidth="xl">
              <Stack spacing={2}>
                {/* 💡 Ajuda rápida em mobile */}
                <Paper sx={{ p: 2, display: { xs: 'block', md: 'none' } }}>
                  <Typography variant="body2" color="text.secondary">
                    Dica: usa o menu (☰) para navegar as secções. ✨
                  </Typography>
                </Paper>

                {children}
              </Stack>
            </Container>
          </Box>
        </main>
      </div>

      {/* Overlay para fechar a sidebar em mobile */}
      <MobileOverlay />
    </SidebarProvider>
  );
}
