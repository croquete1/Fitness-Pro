// src/components/layout/AppHeader.tsx
'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import { alpha } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Brightness7OutlinedIcon from '@mui/icons-material/Brightness7Outlined';
import Brightness4OutlinedIcon from '@mui/icons-material/Brightness4Outlined';
import SearchIcon from '@mui/icons-material/Search';
import { useSidebar } from './SidebarProvider';
import { useTheme as useNextTheme } from 'next-themes';

function greetingByHour(d = new Date()) {
  const h = d.getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

export default function AppHeader() {
  const { data: session } = useSession();
  const name = session?.user?.name || session?.user?.email || 'Utilizador';
  const role = session?.user?.role ? String(session.user.role).toUpperCase() : 'CLIENTE';
  const { openMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useNextTheme();
  const dark = resolvedTheme === 'dark';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={(t) => ({
        borderBottom: `1px solid ${alpha(t.palette.text.primary, 0.12)}`,
        bgcolor: alpha(t.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
      })}
    >
      <Toolbar sx={{ minHeight: 56, gap: 1 }}>
        {/* Burger (mobile) */}
        <IconButton edge="start" onClick={openMobile} sx={{ display: { lg: 'none' } }} aria-label="Abrir menu">
          <MenuRoundedIcon />
        </IconButton>

        {/* Greeting */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', mr: 2, lineHeight: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {greetingByHour()}, {name}
          </Typography>
          <Typography variant="caption" sx={{ letterSpacing: 1 }}>{role}</Typography>
        </Box>

        {/* Pesquisa */}
        <Box
          sx={(t) => ({
            position: 'relative',
            borderRadius: 1,
            backgroundColor: alpha(t.palette.text.primary, 0.06),
            '&:hover': { backgroundColor: alpha(t.palette.text.primary, 0.1) },
            ml: 1, mr: 2, flex: 1, maxWidth: 900,
          })}
        >
          <Box sx={{ p: '6px', height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SearchIcon fontSize="small" />
          </Box>
          <InputBase
            placeholder="Pesquisar…"
            inputProps={{ 'aria-label': 'Pesquisar' }}
            sx={{ color: 'inherit', pl: 4, width: '100%' }}
          />
        </Box>

        {/* Sino + tema + logout */}
        <IconButton aria-label="Notificações">
          <Badge color="error" badgeContent={0}>
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>

        <IconButton aria-label="Alternar tema" onClick={() => setTheme(dark ? 'light' : 'dark')}>
          {dark ? <Brightness7OutlinedIcon /> : <Brightness4OutlinedIcon />}
        </IconButton>

        <IconButton
          aria-label="Terminar sessão"
          onClick={() => signOut({ callbackUrl: '/login' })}
          sx={(t) => ({
            border: `1px solid ${alpha(t.palette.text.primary, 0.2)}`,
            borderRadius: 1, px: 1.5, ml: 1,
          })}
        >
          <Typography variant="button">Terminar sessão</Typography>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
