'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import AccessibilityNewOutlined from '@mui/icons-material/AccessibilityNewOutlined';
import FitnessCenterOutlined from '@mui/icons-material/FitnessCenterOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';

import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Nav = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  activePrefix?: string;
};

const NAV_ITEMS: Nav[] = [
  { href: '/dashboard/admin',               label: 'Painel',                 icon: <DashboardOutlined />, exact: true, activePrefix: '/dashboard/admin' },
  { href: '/dashboard/admin/approvals',     label: 'Aprovações',             icon: <CheckCircleOutlined />, activePrefix: '/dashboard/admin/approvals' },
  { href: '/dashboard/admin/users',         label: 'Utilizadores',           icon: <GroupOutlined />, activePrefix: '/dashboard/admin/users' },
  { href: '/dashboard/admin/clients',       label: 'Clientes',               icon: <AccessibilityNewOutlined />, activePrefix: '/dashboard/admin/clients' },
  { href: '/dashboard/admin/exercises',     label: 'Exercícios',             icon: <FitnessCenterOutlined />, activePrefix: '/dashboard/admin/exercises' },
  { href: '/dashboard/admin/plans',         label: 'Planos',                 icon: <ListAltOutlined />, activePrefix: '/dashboard/admin/plans' },
  { href: '/dashboard/admin/pts-schedule',  label: 'Agenda PTs',             icon: <CalendarMonthOutlined />, activePrefix: '/dashboard/admin/pts-schedule' },
  { href: '/dashboard/admin/notifications', label: 'Notificações',           icon: <NotificationsOutlined />, activePrefix: '/dashboard/admin/notifications' },
  { href: '/dashboard/admin/history',       label: 'Histórico',              icon: <HistoryOutlined />, activePrefix: '/dashboard/admin/history' },
  { href: '/dashboard/system',              label: 'Sistema',                icon: <SettingsOutlined />, activePrefix: '/dashboard/system' },
];

function isActive(path: string, it: Nav) {
  if (it.exact) return path === it.href;
  if (it.activePrefix) return path.startsWith(it.activePrefix);
  return path.startsWith(it.href);
}

function Header({ userLabel, collapsed }: { userLabel?: string; collapsed: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, py: 1 }}>
      <Avatar
        src="/logo.png"
        alt="Logo"
        sx={{ width: 28, height: 28, fontWeight: 800 }}
        imgProps={{ referrerPolicy: 'no-referrer' }}
      >
        FP
      </Avatar>
      {!collapsed && !!userLabel && (
        <Box sx={{ lineHeight: 1.1, minWidth: 0 }}>
          <Box component="div" sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            🛠️ Admin • {userLabel}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function SidebarAdminInner({ userLabel }: { userLabel?: string }) {
  const path = usePathname();
  const { collapsed, isMobile, closeMobile } = useSidebar();

  return (
    <SidebarBase header={<Header userLabel={userLabel} collapsed={collapsed} />}>
      <List dense disablePadding sx={{ px: 0.5, py: 0.5, display: 'grid', gap: 0.5 }}>
        {NAV_ITEMS.map((it) => {
          const active = isActive(path, it);

          const Button = (
            <ListItemButton
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
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': { bgcolor: 'action.selected' },
                },
                '&.Mui-selected .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 700,
                },
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
                {it.icon}
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
    </SidebarBase>
  );
}

export default React.memo(SidebarAdminInner);
