// src/components/layout/SidebarPT.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar, Box, List, ListItemButton, ListItemIcon, ListItemText, Tooltip,
} from '@mui/material';

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';

import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Nav = { href: string; label: string; icon: React.ReactNode; exact?: boolean; activePrefix?: string };

export default function SidebarPT({ userLabel }: { userLabel?: string }) {
  const path = usePathname();
  const { collapsed, isMobile, closeMobile } = useSidebar();

  const items: Nav[] = [
    { href: '/dashboard/pt', label: 'Painel', icon: <DashboardOutlined />, exact: true, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/clients', label: 'Clientes', icon: <GroupOutlined />, activePrefix: '/dashboard/pt/clients' },
    { href: '/dashboard/pt/sessions', label: 'Sessões', icon: <CalendarMonthOutlined />, activePrefix: '/dashboard/pt/sessions' },
    { href: '/dashboard/pt/my-plan', label: 'Planos', icon: <ListAltOutlined />, activePrefix: '/dashboard/pt/my-plan' },
    { href: '/dashboard/pt/messages', label: 'Mensagens', icon: <ChatBubbleOutline />, activePrefix: '/dashboard/pt/messages' },
    { href: '/dashboard/notifications', label: 'Notificações', icon: <NotificationsOutlined />, activePrefix: '/dashboard/notifications' },
    { href: '/dashboard/history', label: 'Histórico', icon: <HistoryOutlined />, activePrefix: '/dashboard/history' },
    { href: '/dashboard/profile', label: 'Perfil', icon: <AccountCircleOutlined />, activePrefix: '/dashboard/profile' },
  ];

  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, p: 1.5 }}>
      <Avatar src="/logo.png" alt="Fitness Pro" sx={{ width: 28, height: 28, fontWeight: 800 }} imgProps={{ referrerPolicy: 'no-referrer' }}>
        FP
      </Avatar>
      {!collapsed && (
        <Box sx={{ lineHeight: 1.1, minWidth: 0 }}>
          <Box component="div" sx={{ fontSize: 14, fontWeight: 700, letterSpacing: .2 }}>Fitness Pro</Box>
          {/* ❌ sem nome/cargo aqui para não duplicar com o header global */}
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
                borderRadius: 1.5, height: 40,
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
          return <React.Fragment key={it.href}>{collapsed ? <Tooltip title={it.label} placement="right" arrow disableInteractive>{Button}</Tooltip> : Button}</React.Fragment>;
        })}
      </List>
    </SidebarBase>
  );
}
