'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Box,
  Stack,
  IconButton,
  Typography,
  Chip,
  Avatar,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import NotificationsRounded from '@mui/icons-material/NotificationsRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';

import { signOut } from 'next-auth/react';

import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { useSidebar } from './SidebarProvider';

type Props = {
  userLabel?: string;
  role?: 'ADMIN' | 'TRAINER' | 'CLIENT' | string;
};

function roleEmoji(role?: string) {
  const r = String(role || '').toUpperCase();
  if (r === 'ADMIN') return '🛠️ Admin';
  if (r === 'TRAINER') return '🧑‍🏫 PT';
  return '💪 Cliente';
}

export default function AppHeader({ userLabel, role }: Props) {
  const { openMobile, collapsed, setCollapsed } = useSidebar();

  // notificações (exemplo mock; podes ligar a API depois)
  const [notifCount] = React.useState<number>(3);

  // menu do utilizador
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    // 🔒 termina sessão
    await signOut({ callbackUrl: '/login' });
  };

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
      <Toolbar sx={{ minHeight: 56, gap: 1 }}>
        {/* ☰ Mobile */}
        <Tooltip title="Abrir menu">
          <IconButton
            size="large"
            onClick={() => openMobile(true)}
            sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
            aria-label="Abrir menu"
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        {/* Marca / voltar à dashboard */}
        <Box
          component={Link}
          href="/dashboard"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <BrandLogo size={22} />
          <Typography variant="subtitle2" fontWeight={800} letterSpacing={0.2}>
            Fitness Pro
          </Typography>
        </Box>

        {/* Toggle rail (desktop) */}
        <Tooltip title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}>
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Alternar sidebar"
            sx={{ ml: 1, display: { xs: 'none', lg: 'inline-flex' } }}
          >
            {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
          </IconButton>
        </Tooltip>

        {/* Pesquisa (md+) */}
        <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, px: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="🔎 Pesquisar…"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Ações à direita */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Notificações com Badge */}
          <Tooltip title="Notificações">
            <IconButton size="large" aria-label="Notificações">
              <Badge color="error" badgeContent={notifCount} max={9}>
                <NotificationsRounded />
              </Badge>
            </IconButton>
          </Tooltip>

          <ThemeToggle />

          {/* Identificação + menu do utilizador */}
          <Chip
            size="small"
            variant="outlined"
            sx={{ borderRadius: '999px', pl: 0.5 }}
            onClick={handleMenu}
            clickable
            avatar={
              <Avatar
                alt="Utilizador"
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 14,
                  bgcolor: 'primary.main',
                }}
              >
                {userLabel?.slice(0, 1)?.toUpperCase() || 'U'}
              </Avatar>
            }
            label={
              <Typography variant="body2" component="span">
                {roleEmoji(role)}
                {userLabel ? ` • ${userLabel}` : ''}
              </Typography>
            }
          />

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <PersonRounded fontSize="small" />
              </ListItemIcon>
              Perfil 👤
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <SettingsRounded fontSize="small" />
              </ListItemIcon>
              Preferências ⚙️
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutRounded fontSize="small" />
              </ListItemIcon>
              Terminar sessão 🚪
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
