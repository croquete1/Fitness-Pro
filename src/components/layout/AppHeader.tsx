'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, Box, IconButton, Tooltip, TextField, InputAdornment,
  Avatar, Menu, MenuItem, Divider, Typography, ListItemIcon, Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';

import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import HeaderBell from './HeaderBell';
import { useSidebar } from './SidebarProvider';
import { signOut } from 'next-auth/react';

type Props = { userLabel?: string; role?: string };

function roleBadge(role?: string) {
  const r = String(role || 'CLIENT').toUpperCase();
  if (r === 'ADMIN') return '🛠️ Admin';
  if (r === 'TRAINER' || r === 'PT') return '🧑‍🏫 PT';
  return '💪 Cliente';
}

export default function AppHeader({ userLabel, role }: Props) {
  const router = useRouter();
  const { openMobile } = useSidebar();

  const [q, setQ] = React.useState('');
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/dashboard/search?q=${encodeURIComponent(query)}` : '/dashboard/search');
  };

  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const closeMenu = () => setAnchor(null);

  return (
    <AppBar position="sticky" color="inherit" elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', backdropFilter: 'saturate(140%) blur(6px)' }}>
      <Container maxWidth="xl" disableGutters>
        <Toolbar sx={{ gap: 1.5 }}>
          {/* Mobile menu */}
          <Tooltip title="Menu">
            <IconButton edge="start" onClick={() => openMobile(true)} sx={{ display: { xs: 'inline-flex', lg: 'none' } }}>
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* Brand (só no header) */}
          <Box component={Link} href="/dashboard"
               sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
            <BrandLogo size={22} />
            <Typography variant="subtitle2" fontWeight={800} sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Fitness Pro
            </Typography>
          </Box>

          {/* Search – centrada */}
          <Box component="form" onSubmit={onSearch}
               sx={{ flex: '0 1 720px', mx: 'auto', width: '100%', maxWidth: 720 }}>
            <TextField
              size="small" fullWidth placeholder="Pesquisar utilizadores/planos/sessões/exercícios… 🔎"
              value={q} onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Ações à direita */}
          <HeaderBell />
          <Tooltip title="Sistema">
            <IconButton component={Link} href="/dashboard/system" aria-label="Sistema">
              <SettingsOutlined />
            </IconButton>
          </Tooltip>
          <ThemeToggle />

          {/* Utilizador */}
          <Tooltip title="Conta">
            <IconButton onClick={openMenu} sx={{ ml: 0.5 }}>
              <Avatar sx={{ width: 28, height: 28 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchor} open={!!anchor} onClose={closeMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 240 } } }}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} noWrap>
                {userLabel || 'Utilizador'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {roleBadge(role)}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={Link} href="/dashboard/profile" onClick={closeMenu}>
              <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
              Perfil
            </MenuItem>
            <MenuItem component={Link} href="/dashboard/notifications" onClick={closeMenu}>
              <ListItemIcon><NotificationsOutlined fontSize="small" /></ListItemIcon>
              Notificações
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { closeMenu(); signOut({ callbackUrl: '/login' }); }}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Terminar sessão
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
