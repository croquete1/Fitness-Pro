'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar, Box, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, IconButton,
  Badge, ListSubheader, Divider,
} from '@mui/material';

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Nav = { href: string; label: string; icon: React.ReactNode; exact?: boolean; activePrefix?: string; badge?: number };

export default function SidebarClient({
  messagesCount = 0,
  notificationsCount = 0,
}: {
  messagesCount?: number;
  notificationsCount?: number;
}) {
  const path = usePathname();
  const { collapsed, isMobile, closeMobile, toggleCollapse } = useSidebar();

  const painel: Nav[] = [
    { href: '/dashboard/clients', label: 'Painel', icon: <DashboardOutlined />, exact: true, activePrefix: '/dashboard/clients' },
  ];
  const treino: Nav[] = [
    { href: '/dashboard/my-plan', label: 'Os meus planos', icon: <ListAltOutlined />, activePrefix: '/dashboard/my-plan' },
    { href: '/dashboard/sessions', label: 'Sessões', icon: <CalendarMonthOutlined />, activePrefix: '/dashboard/sessions' },
  ];
  const comunicacao: Nav[] = [
    { href: '/dashboard/messages', label: 'Mensagens', icon: <ChatBubbleOutline />, activePrefix: '/dashboard/messages', badge: messagesCount },
    { href: '/dashboard/notifications', label: 'Notificações', icon: <NotificationsOutlined />, activePrefix: '/dashboard/notifications', badge: notificationsCount },
  ];
  const conta: Nav[] = [
    { href: '/dashboard/history', label: 'Histórico', icon: <HistoryOutlined />, activePrefix: '/dashboard/history' },
    { href: '/dashboard/profile', label: 'Perfil', icon: <AccountCircleOutlined />, activePrefix: '/dashboard/profile' },
  ];

  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25, minWidth: 0, p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <Avatar src="/logo.png" alt="Fitness Pro" sx={{ width: 28, height: 28, fontWeight: 800 }} imgProps={{ referrerPolicy: 'no-referrer' }}>
          FP
        </Avatar>
        {!collapsed && (
          <Box sx={{ lineHeight: 1.1, minWidth: 0 }}>
            <Box component="div" sx={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.2 }}>Fitness Pro</Box>
          </Box>
        )}
      </Box>
      <IconButton
        onClick={toggleCollapse}
        sx={{
          ml: 'auto', width: 32, height: 32, borderRadius: 1.25, border: 1, borderColor: 'divider',
          bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' },
        }}
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </IconButton>
    </Box>
  );

  function renderSection(title: string, items: Nav[]) {
    return (
      <React.Fragment key={title}>
        {!collapsed && (
          <ListSubheader
            disableSticky
            sx={{ bgcolor: 'transparent', color: 'text.secondary', fontSize: 11, letterSpacing: 0.6, py: 1.25, mt: 0.5 }}
          >
            {title}
          </ListSubheader>
        )}
        <List dense disablePadding sx={{ px: 0.5, display: 'grid', gap: 0.5 }}>
          {items.map((it) => {
            const active = it.exact ? path === it.href
              : (it.activePrefix ? path.startsWith(it.activePrefix) : path.startsWith(it.href));

            const icon = it.badge && it.badge > 0
              ? <Badge color="error" badgeContent={it.badge} overlap="circular" max={99}>{it.icon as any}</Badge>
              : it.icon;

            const Button = (
              <ListItemButton
                key={it.href}
                component={Link}
                href={it.href}
                prefetch={false}
                onClick={() => { if (isMobile) closeMobile(); }}
                selected={active}
                aria-current={active ? 'page' : undefined}
                aria-label={collapsed ? it.label : undefined}
                sx={{
                  borderRadius: 1.5,
                  height: 40,
                  transition: (t) => t.transitions.create(['background-color', 'transform'], { duration: t.transitions.duration.shorter }),
                  '&:hover': { transform: 'translateX(1px)' },
                  '&.Mui-selected': { bgcolor: 'action.selected', '&:hover': { bgcolor: 'action.selected' } },
                  '&.Mui-selected .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 36,
                    mr: collapsed ? 0 : 1,
                    justifyContent: 'center',
                    color: active ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={it.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, noWrap: true }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <React.Fragment key={it.href}>
                {collapsed ? (
                  <Tooltip title={it.label} placement="right" arrow disableInteractive>
                    {Button}
                  </Tooltip>
                ) : (
                  Button
                )}
              </React.Fragment>
            );
          })}
        </List>
        <Divider sx={{ my: 1 }} />
      </React.Fragment>
    );
  }

  return (
    <SidebarBase header={header}>
      {renderSection('Painel', painel)}
      {renderSection('Treino', treino)}
      {renderSection('Comunicação', comunicacao)}
      {renderSection('Conta', conta)}
    </SidebarBase>
  );
}
