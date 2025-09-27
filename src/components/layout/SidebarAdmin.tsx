'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar, Box, List, ListItemButton, ListItemIcon, ListItemText, Tooltip,
} from '@mui/material';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import FitnessCenterOutlined from '@mui/icons-material/FitnessCenterOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import SidebarBase from './SidebarBase';
import { useSidebar } from './SidebarProvider';

type Nav = { href: string; label: string; icon: React.ReactNode; exact?: boolean; activePrefix?: string };

const NAV: Nav[] = [
  { href: '/dashboard/admin', label: 'Painel', icon: <DashboardOutlined />, exact: true, activePrefix: '/dashboard/admin' },
  { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <GroupOutlined />, activePrefix: '/dashboard/admin/users' },
  { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <CheckCircleOutlined />, activePrefix: '/dashboard/admin/approvals' },
  { href: '/dashboard/admin/exercises', label: 'Exercícios', icon: <FitnessCenterOutlined />, activePrefix: '/dashboard/admin/exercises' },
  { href: '/dashboard/admin/plans', label: 'Planos', icon: <ListAltOutlined />, activePrefix: '/dashboard/admin/plans' },
  { href: '/dashboard/admin/pts-schedule', label: 'Agenda PTs', icon: <CalendarMonthOutlined />, activePrefix: '/dashboard/admin/pts-schedule' },
  { href: '/dashboard/admin/notifications', label: 'Notificações', icon: <NotificationsOutlined />, activePrefix: '/dashboard/admin/notifications' },
  { href: '/dashboard/admin/history', label: 'Histórico', icon: <HistoryOutlined />, activePrefix: '/dashboard/admin/history' },
  { href: '/dashboard/system', label: 'Sistema', icon: <SettingsOutlined />, activePrefix: '/dashboard/system' },
];

function isActive(path: string, it: Nav) {
  if (it.exact) return path === it.href;
  return it.activePrefix ? path.startsWith(it.activePrefix) : path.startsWith(it.href);
}

export default function SidebarAdmin({ userLabel }: { userLabel?: string }) {
  const path = usePathname();
  const { collapsed, isMobile, closeMobile } = useSidebar();

  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Avatar src="/logo.png" alt="FP" sx={{ width: 28, height: 28, fontWeight: 800 }}>FP</Avatar>
      {!collapsed && userLabel && (
        <Box sx={{ lineHeight: 1.1, minWidth: 0, fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          🛠️ Admin • {userLabel}
        </Box>
      )}
    </Box>
  );

  return (
    <SidebarBase header={header}>
      <List dense disablePadding sx={{ px: 0.5, py: 0.5, display: 'grid', gap: 0.5 }}>
        {NAV.map((it) => {
          const active = isActive(path, it);
          const button = (
            <ListItemButton
              component={Link}
              href={it.href}
              onClick={() => { if (isMobile) closeMobile(); }}
              selected={active}
              aria-current={active ? 'page' : undefined}
              sx={{
                height: 40,
                '& .MuiListItemText-primary': { fontSize: 14, fontWeight: active ? 700 : 500 },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, mr: collapsed ? 0 : 1, justifyContent: 'center', color: active ? 'primary.main' : 'text.secondary' }}>
                {it.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={it.label} />}
            </ListItemButton>
          );

          return (
            <React.Fragment key={it.href}>
              {collapsed ? (
                <Tooltip title={it.label} placement="right" arrow disableInteractive>
                  {button}
                </Tooltip>
              ) : button}
            </React.Fragment>
          );
        })}
      </List>
    </SidebarBase>
  );
}
