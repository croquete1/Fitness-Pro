'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Badge,
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Nav = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  activePrefix?: string;
  badge?: number;
};

type Props = {
  messagesCount?: number;
  notificationsCount?: number;
};

export default function SidebarPT({ messagesCount = 0, notificationsCount = 0 }: Props) {
  const path = usePathname();
  const { collapsed, peek, isMobile, closeMobile, toggleCollapse } = useSidebar();
  const showLabels = !collapsed || peek;
  const isRail = collapsed && !peek;

  const items: Nav[] = [
    { href: '/dashboard/pt', label: 'Painel', icon: <DashboardOutlined />, exact: true, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/clients', label: 'Clientes', icon: <GroupOutlined />, activePrefix: '/dashboard/pt/clients' },
    { href: '/dashboard/pt/schedule', label: 'Agenda', icon: <CalendarMonthOutlined />, activePrefix: '/dashboard/pt/schedule' },
    { href: '/dashboard/pt/workouts', label: 'Treinos', icon: <ListAltOutlined />, activePrefix: '/dashboard/pt/workouts' },
    {
      href: '/dashboard/pt/messages',
      label: 'Mensagens',
      icon: <ChatBubbleOutline />,
      activePrefix: '/dashboard/pt/messages',
      badge: messagesCount,
    },
    {
      href: '/dashboard/notifications',
      label: 'Notificações',
      icon: <NotificationsOutlined />,
      activePrefix: '/dashboard/notifications',
      badge: notificationsCount,
    },
    { href: '/dashboard/history', label: 'Histórico', icon: <HistoryOutlined />, activePrefix: '/dashboard/history' },
    { href: '/dashboard/profile', label: 'Perfil', icon: <AccountCircleOutlined />, activePrefix: '/dashboard/profile' },
    { href: '/dashboard/settings', label: 'Definições', icon: <SettingsOutlined />, activePrefix: '/dashboard/settings' },
  ];

  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25, minWidth: 0, p: 1.5 }}>
      {!isRail && (
        <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: 0.6 }}>
          Atalhos PT
        </Typography>
      )}
      <IconButton onClick={toggleCollapse} sx={{ ml: 'auto', width: 32, height: 32, borderRadius: 1.25, border: 1, borderColor: 'divider', bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </IconButton>
    </Box>
  );

  return (
    <SidebarBase header={header}>
      <List dense disablePadding sx={{ px: 0.5, py: 0.5, display: 'grid', gap: 0.5 }}>
        {items.map((it) => {
          const active = it.exact ? path === it.href : (it.activePrefix ? path.startsWith(it.activePrefix) : path.startsWith(it.href));
          const iconWrapped = (it.badge ?? 0) > 0
            ? (
                <Badge color="error" badgeContent={it.badge} overlap="circular" max={99}>
                  {it.icon as any}
                </Badge>
              )
            : it.icon;

          const Button = (
            <ListItemButton
              component={Link}
              href={it.href}
              prefetch={false}
              onClick={() => { if (isMobile) closeMobile(); }}
              selected={active}
              aria-current={active ? 'page' : undefined}
              aria-label={isRail ? it.label : undefined}
              sx={{
                borderRadius: 1.5, height: 40,
                '&.Mui-selected': { bgcolor: 'action.selected', '&:hover': { bgcolor: 'action.selected' } },
                '&.Mui-selected .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 },
              }}
            >
              <ListItemIcon sx={{ minWidth: showLabels ? 36 : 0, mr: showLabels ? 1 : 0, justifyContent: 'center', color: active ? 'primary.main' : 'text.secondary' }}>
                {iconWrapped}
              </ListItemIcon>
              {showLabels && <ListItemText primary={it.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, noWrap: true }} />}
            </ListItemButton>
          );
          return <React.Fragment key={it.href}>{isRail ? <Tooltip title={it.label} placement="right" arrow disableInteractive>{Button}</Tooltip> : Button}</React.Fragment>;
        })}
      </List>
    </SidebarBase>
  );
}
