'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, IconButton, Typography, Box, Stack, Tooltip, Chip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import HeaderBell from './HeaderBell';
import { useSidebar } from './SidebarProvider';

type Props = { userLabel?: string; role?: string };

export default function AppHeader({ userLabel, role }: Props) {
  const { isMobile, toggle, collapsed, setCollapsed, openMobile } = useSidebar();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        backdropFilter: 'saturate(140%) blur(6px)',
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: 56 }}>
        {/* burger / rail toggle */}
        {isMobile ? (
          <Tooltip title="Abrir menu">
            <IconButton onClick={() => openMobile(true)} edge="start" size="large" aria-label="menu">
              <MenuIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={collapsed ? 'Expandir barra lateral' : 'Encolher barra lateral'}>
            <IconButton onClick={() => setCollapsed(!collapsed)} edge="start" size="large" aria-label="toggle sidebar">
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}

        {/* brand */}
        <Box component={Link} href="/dashboard" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, textDecoration: 'none', color: 'inherit' }}>
          <BrandLogo size={22} />
          <Typography variant="subtitle1" fontWeight={800}>Fitness Pro</Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* ações */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <HeaderBell />
          <ThemeToggle />
          <Chip
            size="small"
            variant="outlined"
            label={`${role === 'ADMIN' ? '🛠️ Admin' : role === 'TRAINER' ? '🧑‍🏫 PT' : '💪 Cliente'}${userLabel ? ` • ${userLabel}` : ''}`}
          />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
