'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Tooltip, Divider, Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';

import BrandLogo from '@/components/BrandLogo';
import { useSidebar } from './SidebarProvider';

type Item = { label: string; href: string; emoji?: string; icon?: React.ReactNode };

function itemsFor(role: string): Item[] {
  const common: Item[] = [
    { label: 'Painel', href: '/dashboard', emoji: '📊', icon: <DashboardIcon /> },
  ];
  if (role === 'ADMIN') {
    return [
      ...common,
      { label: 'Utilizadores', href: '/dashboard/admin', emoji: '👥', icon: <GroupIcon /> },
      { label: 'Aprovações', href: '/dashboard/admin/approvals', emoji: '✅', icon: <CheckCircleIcon /> },
      { label: 'Sistema', href: '/dashboard/admin/system', emoji: '⚙️', icon: <SettingsIcon /> },
    ];
  }
  if (role === 'TRAINER') {
    return [
      ...common,
      { label: 'Clientes', href: '/dashboard/pt/clients', emoji: '👥', icon: <GroupIcon /> },
      { label: 'Sessões', href: '/dashboard/pt/sessions', emoji: '🏋️', icon: <FitnessCenterIcon /> },
      { label: 'Definições', href: '/dashboard/pt/settings', emoji: '⚙️', icon: <SettingsIcon /> },
    ];
  }
  // CLIENT
  return [
    ...common,
    { label: 'O meu plano', href: '/dashboard/clients', emoji: '📅', icon: <FitnessCenterIcon /> },
    { label: 'Definições', href: '/dashboard/clients/settings', emoji: '⚙️', icon: <SettingsIcon /> },
  ];
}

export default function RoleSidebar({ role, userLabel }: { role: string; userLabel?: string }) {
  const path = usePathname();
  const { isMobile, mobileOpen, closeMobile, collapsed, railWidth, panelWidth } = useSidebar();

  const width = collapsed ? railWidth : panelWidth;
  const list = itemsFor((role || 'CLIENT').toUpperCase());

  const content = (
    <Box sx={{ width, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ minHeight: 56, px: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BrandLogo size={24} />
          {!collapsed && (
            <Box>
              <Typography fontWeight={800} lineHeight={1.1}>Fitness Pro</Typography>
              <Typography variant="caption" color="text.secondary">
                {role === 'ADMIN' ? '🛠️ Admin' : role === 'TRAINER' ? '🧑‍🏫 PT' : '💪 Cliente'}
                {userLabel ? ` • ${userLabel}` : ''}
              </Typography>
            </Box>
          )}
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ py: 1 }}>
        {list.map((item) => {
          const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));
          const btn = (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={active}
              sx={{
                borderRadius: 1.5,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
              }}
              onClick={isMobile ? () => closeMobile() : undefined}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.emoji ? <span style={{ fontSize: 18 }}>{item.emoji}</span> : item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          );
          return collapsed ? (
            <Tooltip key={item.href} title={item.label} placement="right">
              {btn}
            </Tooltip>
          ) : btn;
        })}
      </List>
      <Box sx={{ flex: 1 }} />
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={closeMobile}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width } }}
      >
        {content}
      </Drawer>
    );
  }
  return (
    <Drawer
      open
      variant="permanent"
      PaperProps={{ sx: { position: 'relative', width, overflow: 'hidden' } }}
    >
      {content}
    </Drawer>
  );
}
