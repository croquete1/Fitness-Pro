'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider
} from '@mui/material';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import PersonOutline from '@mui/icons-material/PersonOutline';
import BrandLogo from '@/components/BrandLogo';
import { useSidebar } from './SidebarProvider';

type MatchFn = (candidateHref: string) => boolean;
type Item = { href: string; label: string; icon: React.ReactNode; match?: MatchFn };

function itemsFor(role: string, path: string): Item[] {
  // fun fact: fazemos "bound" do path aqui → match(href) => path.startsWith(href)
  const boundMatch: MatchFn = (candidate) => path.startsWith(candidate);

  if (role === 'ADMIN') {
    return [
      { href: '/dashboard/admin', label: 'Painel', icon: <DashboardOutlined />, match: boundMatch },
      { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <GroupOutlined />, match: boundMatch },
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <TaskAltOutlined />, match: boundMatch },
      { href: '/dashboard/admin/system', label: 'Sistema', icon: <SettingsOutlined />, match: boundMatch },
    ];
  }

  if (role === 'TRAINER') {
    return [
      { href: '/dashboard/pt', label: 'Painel', icon: <DashboardOutlined />, match: boundMatch },
      { href: '/dashboard/pt/clients', label: 'Clientes', icon: <PersonOutline />, match: boundMatch },
      { href: '/dashboard/pt/plans', label: 'Planos', icon: <AssignmentOutlined />, match: boundMatch },
      { href: '/dashboard/pt/agenda', label: 'Agenda', icon: <CalendarMonthOutlined />, match: boundMatch },
      { href: '/dashboard/pt/system', label: 'Sistema', icon: <SettingsOutlined />, match: boundMatch },
    ];
  }

  // CLIENT
  return [
    { href: '/dashboard/clients', label: 'Painel', icon: <DashboardOutlined />, match: boundMatch },
    { href: '/dashboard/clients/plan', label: 'Plano', icon: <AssignmentOutlined />, match: boundMatch },
    { href: '/dashboard/clients/sessions', label: 'Sessões', icon: <CalendarMonthOutlined />, match: boundMatch },
    { href: '/dashboard/clients/progress', label: 'Progresso', icon: <TrendingUpOutlined />, match: boundMatch },
    { href: '/dashboard/clients/system', label: 'Sistema', icon: <SettingsOutlined />, match: boundMatch },
  ];
}

function NavItem({
  item, active, collapsed,
}: { item: Item; active: boolean; collapsed: boolean }) {
  return (
    <ListItemButton
      component={Link}
      href={item.href}
      selected={active}
      sx={{
        borderRadius: 1.5,
        mb: 0.5,
        '&.Mui-selected': { bgcolor: 'action.selected' },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
      {!collapsed && <ListItemText primary={item.label} />}
    </ListItemButton>
  );
}

export default function RoleSidebar({ role, userLabel }: { role: string; userLabel?: string }) {
  const { collapsed, mobileOpen, closeMobile, isMobile } = useSidebar();
  const path = usePathname();
  const items = itemsFor(role, path);

  const isActive = (it: Item) => (it.match ? it.match(it.href) : path === it.href);

  const content = (
    <Box
      role="navigation"
      sx={{
        width: collapsed ? 72 : 240,
        transition: 'width .26s var(--sb-ease, cubic-bezier(.18,.9,.22,1))',
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BrandLogo size={22} />
        {!collapsed && (
          <Box>
            <Typography fontWeight={800} lineHeight={1}>Fitness Pro</Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1.1}>
              {role === 'ADMIN' ? '🛠️ Admin' : role === 'TRAINER' ? '🧑‍🏫 PT' : '💪 Cliente'}
              {userLabel ? ` • ${userLabel}` : ''}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider />

      <Box sx={{ p: 1, flex: 1, overflowY: 'auto' }}>
        <List dense>
          {items.map((it) => (
            <NavItem key={it.href} item={it} collapsed={collapsed} active={isActive(it)} />
          ))}
        </List>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 280 } }}
      >
        {content}
      </Drawer>
    );
  }
  return content;
}
