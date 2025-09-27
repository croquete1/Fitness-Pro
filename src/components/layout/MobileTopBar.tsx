// src/components/layout/MobileTopBar.tsx
'use client';

import * as React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Props = {
  title?: string;
  onToggleSidebar?: () => void;
};

export default function MobileTopBar({ title = 'Dashboard', onToggleSidebar }: Props) {
  const { openMobile } = useSidebar();

  const handleToggle = () => {
    onToggleSidebar?.();
    // Abre o drawer da sidebar no mobile
    openMobile(true);
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        display: { xs: 'block', lg: 'none' },
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        backdropFilter: 'saturate(140%) blur(6px)',
      }}
    >
      <Toolbar variant="dense" sx={{ gap: 1 }}>
        <IconButton edge="start" onClick={handleToggle} aria-label="Abrir menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={800}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
