// src/components/layout/SidebarAdmin.tsx
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

import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Nav = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  activePrefix?: string;
};

export default function SidebarAdmin({ userLabel }: { userLabel?: string }) {
  const path = usePathname();
  const { collapsed, isMobile, closeMobile } = useSidebar();

  const items: Nav[] = [
    { href: '/dashboard/admin', label: 'Painel', icon: <DashboardOutlined />, exact: true, activePrefix: '/dashboard/admin' },
    { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <CheckCircleOutlined />, activePrefix: '/dashboard/admin/approvals' },
    { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <GroupOutlined />, activePrefix: '/dashboard/admin/users' },
    // Removido "Clientes" duplicado (já coberto por Utilizadores)
    { href: '/dashboard/admin/exercises', label: 'Exercícios', icon: <FitnessCenterOutlined />, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans', label: 'Planos', icon: <ListAltOutlined />, activePrefix: '/dashboard/admin/plans' },
    // Corrige o path real da Agenda PTs (ajusta se usares outro):
    { href: '/dashboard/admin/pts-schedule', label: 'Agenda PTs', icon: <CalendarMonthOutlined />, activePrefix: '/dashboard/admin/pts-schedule' },
    { href: '/dashboard/admin/notifications', label: 'Notificações', icon: <NotificationsOutlined />, activePrefix: '/dashboard/admin/notifications' },
    { href: '/dashboard/admin/history', label: 'Histórico', icon: <HistoryOutlined />, activePrefix: '/dashboard/admin/history' },
    { href: '/dashboard/system', label: 'Sistema', icon: <SettingsOutlined />, activePrefix: '/dashboard/system' },
  ];

  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, p: 1.5 }}>
      <Avatar src="/logo.png" alt="Fitness Pro" sx={{ width: 28, height: 28, fontWeight: 800 }} imgProps={{ referrerPolicy: 'no-referrer' }}>
        FP
      </Avatar>
      {!collapsed && (
        <Box sx={{ lineHeight: 1.1, minWidth: 0 }}>
          <Box component="div" sx={{ fontSize: 14, fontWeight: 700, letterSpacing: .2 }}>
            Fitness Pro
          </Box>
          {/* ❌ removemos o “nome/cargo” duplicado da sidebar (só no header global) */}
        </Box>
      )}
    </Box>
  );

  return (
    <SidebarBase header={header}>
      <List dense disablePadding sx={{ px: 0.5, py: 0.5, display: 'grid', gap: 0.5 }}>
        {items.map((it) => {
          const active = it.exact ? path === it.href : (it.activePrefix ? path.startsWith(it.activePrefix) : path.startsWith(it.href));

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
                '&.Mui-selected': { bgcolor: 'action.selected', '&:hover': { bgcolor: 'action.selected' } },
                '&.Mui-selected .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, mr: collapsed ? 0 : 1, justifyContent: 'center', color: active ? 'primary.main' : 'text.secondary' }}>
                {it.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={it.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, noWrap: true }} />}
            </ListItemButton>
          );

          return (
            <React.Fragment key={it.href}>
              {collapsed ? <Tooltip title={it.label} placement="right" arrow disableInteractive>{Button}</Tooltip> : Button}
            </React.Fragment>
          );
        })}
      </List>
    </SidebarBase>
  );
}
