'use client';

import * as React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Stack, Chip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

type Props = {
  title?: string;
  isMobile?: boolean;
  /** Setter booleano vindo do layout (ex.: setMobileOpen) */
  openMobile?: (open: boolean) => void;
  /** Rótulo do utilizador (ex.: nome ou email) */
  userLabel?: string;
  /** Função/papel do utilizador (ex.: 'admin' | 'pt' | 'client' | ...) */
  role?: string;
  right?: React.ReactNode;
};

function roleColor(role?: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
  const s = String(role ?? '').toLowerCase();
  if (!s) return 'default';
  if (s === 'admin') return 'secondary';
  if (s === 'pt' || s === 'trainer') return 'primary';
  if (s === 'client' || s === 'cliente' || s === 'user') return 'success';
  return 'default';
}

export default function AppHeader({
  title = 'Fitness Pro',
  isMobile = false,
  openMobile,
  userLabel,
  role,
  right,
}: Props) {
  // Handler correto para MouseEvent → chama setter booleano
  const handleOpenMobile = React.useCallback(() => {
    if (openMobile) openMobile(true);
  }, [openMobile]);

  return (
    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1, minHeight: 64 }}>
        {isMobile && openMobile && (
          <IconButton aria-label="menu" onClick={handleOpenMobile} edge="start">
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          {userLabel && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {userLabel}
            </Typography>
          )}
          {role && <Chip size="small" label={role} color={roleColor(role)} />}
          {right}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
