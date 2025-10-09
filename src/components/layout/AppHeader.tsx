// src/components/layout/AppHeader.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Brightness4Outlined from '@mui/icons-material/Brightness4Outlined';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { useHeaderCounts } from '@/components/header/HeaderCountsContext';

type Props = {
  userLabel?: string;
  rightSlot?: React.ReactNode;
  /** opcional — se tiveres avatar do utilizador */
  userAvatarUrl?: string | null;
  /** opcional — nome (melhora as iniciais do avatar e o title) */
  userName?: string | null;
  /** opcional — callback de terminar sessão; se não vier, faz fallback para /api/auth/signout */
  onSignOut?: () => Promise<void> | void;
};

function initialsFrom(label?: string | null) {
  const s = (label ?? '').trim();
  if (!s) return '•';
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || '•';
}

export default function AppHeader({
  userLabel,
  rightSlot,
  userAvatarUrl,
  userName,
  onSignOut,
}: Props) {
  const { openMobile } = useSidebar();
  const counts = useHeaderCounts?.();
  const role = counts?.role ?? null;

  const approvalsCount = Number(counts?.approvalsCount ?? 0);
  const messagesCount = Number(counts?.messagesCount ?? 0);
  const notificationsCount = Number(counts?.notificationsCount ?? 0);

  const renderBadge = (value: number, icon: React.ReactElement) =>
    value > 0 ? (
      <Badge color="error" badgeContent={value} max={99}>
        {icon}
      </Badge>
    ) : (
      icon
    );

  // Avatar menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  async function handleSignOut() {
    try {
      if (onSignOut) {
        await onSignOut();
      } else {
        // fallback genérico: API local de signout; se não existir, redireciona
        await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {});
      }
    } finally {
      // pós-logout: volta à landing/login
      window.location.href = '/';
    }
  }

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1, minHeight: 64 }}>
        {/* menu mobile (abre sidebar) */}
        <IconButton aria-label="Abrir menu" onClick={() => openMobile(true)} size="small">
          <MenuIcon />
        </IconButton>

        {/* brand */}
        <Typography
          component={Link}
          href="/dashboard"
          prefetch={false}
          variant="h6"
          sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 800, letterSpacing: 0.2 }}
        >
          Fitness Pro
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* badges role-aware */}
        {role === 'ADMIN' && (
          <Tooltip title="Aprovações">
            <IconButton component={Link} href="/dashboard/admin/approvals" prefetch={false} size="small" sx={{ mr: 0.5 }} aria-label="Ir para Aprovações">
              {renderBadge(approvalsCount, <CheckCircleOutline />)}
            </IconButton>
          </Tooltip>
        )}

        {(role === 'CLIENT' || role === 'TRAINER') && (
          <Tooltip title="Mensagens">
            <IconButton component={Link} href="/dashboard/messages" prefetch={false} size="small" sx={{ mr: 0.5 }} aria-label="Ir para Mensagens">
              {renderBadge(messagesCount, <ChatBubbleOutline />)}
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Notificações">
          <IconButton
            component={Link}
            href={role === 'ADMIN' ? '/dashboard/admin/notifications' : '/dashboard/notifications'}
            prefetch={false}
            size="small"
            sx={{ mr: 1 }}
            aria-label="Ir para Notificações"
          >
            {renderBadge(notificationsCount, <NotificationsIcon />)}
          </IconButton>
        </Tooltip>

        {/* slot opcional (ex.: "Nova sessão") */}
        {rightSlot && <Box sx={{ mr: 1 }}>{rightSlot}</Box>}

        {/* etiqueta do utilizador (texto) */}
        {userLabel && (
          <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }} title={userLabel}>
            {userLabel}
          </Typography>
        )}

        {/* toggle de tema rápido */}
        <ThemeToggleButton />

        {/* avatar + menu */}
        <IconButton
          onClick={handleOpenMenu}
          size="small"
          sx={{ ml: 0.5 }}
          aria-controls={open ? 'user-menu' : undefined}
          aria-haspopup="menu"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            src={userAvatarUrl || undefined}
            alt={userName || userLabel || 'Utilizador'}
            sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700 }}
            imgProps={{ referrerPolicy: 'no-referrer' }}
          >
            {initialsFrom(userName || userLabel)}
          </Avatar>
        </IconButton>

        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          keepMounted
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem component={Link} href="/dashboard/profile" prefetch={false} onClick={handleCloseMenu}>
            <ListItemIcon>
              <PersonOutlineIcon fontSize="small" />
            </ListItemIcon>
            Perfil
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseMenu();
              // o ThemeToggleButton acima já troca; aqui é um atalho no menu
              // Dispara um click no toggler externo (accessibility-friendly)
              const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle="true"]');
              btn?.click();
            }}
          >
            <ListItemIcon>
              <Brightness4Outlined fontSize="small" />
            </ListItemIcon>
            Alternar tema
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Terminar sessão
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
