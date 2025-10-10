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
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Brightness4Outlined from '@mui/icons-material/Brightness4Outlined';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { useHeaderCounts } from '@/components/header/HeaderCountsContext';
import Image from 'next/image';

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
  const { openMobile, isMobile } = useSidebar();
  const counts = useHeaderCounts?.();
  const role = counts?.role ?? null;

  const messagesCount = Number(counts?.messagesCount ?? 0);
  const notificationsCount = Number(counts?.notificationsCount ?? 0);
  const setCounts = counts?.setCounts;

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

  type NotificationItem = { id: string; title: string; href?: string | null; created_at?: string | null };
  const [notifAnchor, setNotifAnchor] = React.useState<null | HTMLElement>(null);
  const [notifItems, setNotifItems] = React.useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const [notifError, setNotifError] = React.useState<string | null>(null);
  const [notifHydrated, setNotifHydrated] = React.useState(false);
  const notifMenuOpen = Boolean(notifAnchor);

  const loadNotifications = React.useCallback(async () => {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const res = await fetch('/api/notifications/dropdown', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error('REQUEST_FAILED');
      const data = await res.json();
      const items: NotificationItem[] = Array.isArray(data?.items)
        ? data.items.map((item: any) => ({
            id: String(item?.id ?? crypto.randomUUID?.() ?? Date.now()),
            title: String(item?.title ?? 'Notificação'),
            href: item?.href ?? null,
            created_at: item?.created_at ?? null,
          }))
        : [];
      setNotifItems(items);
      setNotifHydrated(true);
      if (setCounts) {
        setCounts({ notificationsCount: items.length });
      }
    } catch (error) {
      console.warn('[header] notifications dropdown failed');
      setNotifError('Não foi possível carregar notificações.');
      setNotifItems([]);
    } finally {
      setNotifLoading(false);
    }
  }, [notificationsCount, setCounts]);

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
    if (!notifHydrated) {
      void loadNotifications();
    }
  };

  const handleCloseNotifications = () => {
    setNotifAnchor(null);
  };

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1, minHeight: 64 }}>
        {/* brand */}
        <Box
          component={Link}
          href="/dashboard"
          prefetch={false}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
          onClick={(event) => {
            if (isMobile) {
              event.preventDefault();
              openMobile(true);
            }
          }}
        >
          <Image
            src="/branding/hms-personal-trainer.svg"
            alt="HMS Personal Trainer"
            width={32}
            height={32}
            priority
            style={{ display: 'block' }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.4 }}>
            HMS Personal Trainer
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {(role === 'CLIENT' || role === 'TRAINER') && (
          <Tooltip title="Mensagens">
            <IconButton component={Link} href="/dashboard/messages" prefetch={false} size="small" sx={{ mr: 0.5 }} aria-label="Ir para Mensagens">
              {renderBadge(messagesCount, <ChatBubbleOutline />)}
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Notificações">
          <IconButton
            size="small"
            sx={{ mr: 1 }}
            aria-label="Abrir notificações"
            onClick={handleOpenNotifications}
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

        <Menu
          id="notifications-menu"
          anchorEl={notifAnchor}
          open={notifMenuOpen}
          onClose={handleCloseNotifications}
          keepMounted
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          MenuListProps={{ sx: { p: 0, width: 320, maxWidth: '90vw' } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Notificações recentes
            </Typography>
            {notifLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  A sincronizar…
                </Typography>
              </Box>
            ) : notifError ? (
              <Typography variant="body2" color="text.secondary">
                {notifError}
              </Typography>
            ) : notifItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sem notificações no momento.
              </Typography>
            ) : (
              <List dense disablePadding sx={{ maxHeight: 260, overflowY: 'auto' }}>
                {notifItems.map((item) => (
                  <ListItem
                    key={item.id}
                    disablePadding
                    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <ListItemButton
                      onClick={() => {
                        handleCloseNotifications();
                        if (item.href) {
                          window.location.href = item.href;
                        }
                      }}
                    >
                      <ListItemText
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                        primary={item.title}
                        secondary={item.created_at ? new Date(item.created_at).toLocaleString() : undefined}
                        secondaryTypographyProps={{ fontSize: 11, color: 'text.secondary' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
