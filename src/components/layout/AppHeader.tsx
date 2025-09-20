// src/components/layout/AppHeader.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Brightness7OutlinedIcon from '@mui/icons-material/Brightness7Outlined';
import Brightness4OutlinedIcon from '@mui/icons-material/Brightness4Outlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useTheme as useNextTheme } from 'next-themes';
import { useSidebar } from '@/components/layout/SidebarProvider';
import HeaderBell from '@/components/header/HeaderBell';
import GlobalSearchBox from '@/components/search/GlobalSearchBox';

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
        backdropFilter: 'saturate(180%) blur(8px)',
      })}
    >
      <Toolbar sx={{ minHeight: 56, gap: 1 }}>
        {/* Menu (mobile) */}
        <IconButton edge="start" onClick={openMobile} sx={{ display: { lg: 'none' } }} aria-label="Abrir menu">
          <MenuRoundedIcon />
        </IconButton>

        {/* Pesquisa global */}
        <Box sx={{ flex: 1, maxWidth: 980, mx: 1 }}>
          <GlobalSearchBox onPick={(href) => router.push(href)} />
        </Box>

        {/* Ações à direita */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <HeaderBell />
          <IconButton aria-label="Alternar tema" onClick={() => setTheme(dark ? 'light' : 'dark')}>
            {dark ? <Brightness7OutlinedIcon /> : <Brightness4OutlinedIcon />}
          </IconButton>

          {/* Avatar + menu */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Abrir menu de utilizador">
            <Avatar alt={displayName} src={avatarUrl || undefined} sx={{ width: 32, height: 32 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 240 } } }}
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
            <MenuItem onClick={() => { setAnchorEl(null); signOut({ callbackUrl: '/login' }); }}>
              <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
              Terminar sessão
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
