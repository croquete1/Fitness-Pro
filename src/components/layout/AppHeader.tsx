'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchIcon from '@mui/icons-material/Search';
import Brightness7OutlinedIcon from '@mui/icons-material/Brightness7Outlined';
import Brightness4OutlinedIcon from '@mui/icons-material/Brightness4Outlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useTheme as useNextTheme } from 'next-themes';
import { useSidebar } from '@/components/layout/SidebarProvider';
import HeaderNotifications from '@/components/HeaderNotifications';
import HeaderBell from '@/components/header/HeaderBell';

export default function AppHeader() {
  const { openMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useNextTheme();
  const dark = resolvedTheme === 'dark';
  const { data: session } = useSession();
  const router = useRouter();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const displayName = session?.user?.name || session?.user?.email || 'Utilizador';
  const avatarUrl = (session as any)?.user?.avatar_url || null;

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={(t) => ({
        borderBottom: `1px solid ${t.palette.divider}`,
        bgcolor: t.palette.background.paper,
      })}
    >
      <Toolbar sx={{ minHeight: 56, gap: 1 }}>
        {/* Burger (mobile) */}
        <IconButton edge="start" onClick={openMobile} sx={{ display: { lg: 'none' } }} aria-label="Abrir menu">
          <MenuRoundedIcon />
        </IconButton>

        {/* Pesquisa */}
        <Paper
          elevation={0}
          sx={(t) => ({
            ml: 1, mr: 'auto', flex: 1, maxWidth: 980,
            display: 'flex', alignItems: 'center',
            px: 1, py: 0.5,
            bgcolor: alpha(t.palette.text.primary, 0.06),
            '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.1) },
          })}
        >
          <SearchIcon sx={{ mx: 1 }} fontSize="small" />
          <InputBase placeholder="Pesquisar…" sx={{ flex: 1 }} inputProps={{ 'aria-label': 'Pesquisar' }} />
        </Paper>

        {/* Área de ações compacta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <HeaderNotifications />
          <IconButton aria-label="Alternar tema" onClick={() => setTheme(dark ? 'light' : 'dark')}>
            {dark ? <Brightness7OutlinedIcon /> : <Brightness4OutlinedIcon />}
          </IconButton>

          {/* Avatar com menu */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Abrir menu de utilizador">
            <Avatar
              alt={displayName}
              src={avatarUrl || undefined}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 220 } } }}
          >
            <MenuItem disabled>
              <Box sx={{ fontSize: 12, lineHeight: 1.2 }}>
                <div style={{ fontWeight: 700 }}>{displayName}</div>
                <div style={{ opacity: 0.7 }}>{session?.user?.role}</div>
              </Box>
            </MenuItem>
            <Divider />
<MenuItem onClick={() => { setAnchorEl(null); router.push('/dashboard/profile'); }}>
  <ListItemIcon><PersonOutlineOutlinedIcon fontSize="small" /></ListItemIcon>
  Meu perfil
</MenuItem>
            <Divider />
            <HeaderBell />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                signOut({ callbackUrl: '/login' });
              }}
            >
              <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
              Terminar sessão
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
