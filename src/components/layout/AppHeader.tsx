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
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchIcon from '@mui/icons-material/Search';
import Brightness7OutlinedIcon from '@mui/icons-material/Brightness7Outlined';
import Brightness4OutlinedIcon from '@mui/icons-material/Brightness4Outlined';
import Button from '@mui/material/Button';
import { useTheme as useNextTheme } from 'next-themes';
import { useSidebar } from '@/components/layout/SidebarProvider';
import HeaderNotifications from '@/components/HeaderNotifications';

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
      color="default"
      elevation={0}
      sx={(t) => ({
        borderBottom: `1px solid ${t.palette.divider}`,
        bgcolor: t.palette.background.paper, // evita “fantasmas” no modo claro
      })}
    >
      <Toolbar sx={{ minHeight: 56, gap: 1 }}>
        {/* Burger (mobile) */}
        <IconButton edge="start" onClick={openMobile} sx={{ display: { lg: 'none' } }} aria-label="Abrir menu">
          <MenuRoundedIcon />
        </IconButton>

        {/* Greeting legível */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', mr: 2, lineHeight: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {greetingByHour()}, {name}
          </Typography>
          <Typography variant="caption" sx={{ letterSpacing: 1 }} color="text.secondary">
            {role}
          </Typography>
        </Box>

        {/* Pesquisa com Paper (tema-aware) */}
        <Paper
          elevation={0}
          sx={(t) => ({
            ml: 1, mr: 2, flex: 1, maxWidth: 900,
            display: 'flex', alignItems: 'center',
            px: 1, py: 0.5,
            bgcolor: alpha(t.palette.text.primary, 0.06),
            '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.1) },
          })}
        >
          <SearchIcon sx={{ mx: 1 }} fontSize="small" />
          <InputBase placeholder="Pesquisar…" sx={{ flex: 1 }} inputProps={{ 'aria-label': 'Pesquisar' }} />
        </Paper>

        {/* Sino dropdown + toggle de tema + logout */}
        <HeaderNotifications unread={0} items={[]} />

        <IconButton aria-label="Alternar tema" onClick={() => setTheme(dark ? 'light' : 'dark')}>
          {dark ? <Brightness7OutlinedIcon /> : <Brightness4OutlinedIcon />}
        </IconButton>

        <Button
          variant="outlined"
          size="small"
          onClick={() => signOut({ callbackUrl: '/login' })}
          sx={{ ml: 1 }}
        >
          Terminar sessão
        </Button>
      </Toolbar>
    </AppBar>
  );
}
