'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, IconButton,
  Badge, ListSubheader, Divider, Typography,
} from '@mui/material';

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import LibraryBooksOutlined from '@mui/icons-material/LibraryBooksOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import PolicyOutlined from '@mui/icons-material/PolicyOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Nav = {
  href: string; label: string; icon: React.ReactNode;
  exact?: boolean; activePrefix?: string; badge?: number;
};

export default function SidebarAdmin({
  approvalsCount = 0,
  notificationsCount = 0,
  ptsTodayCount = 0,
  ptsNext7Count = 0, // reservado (para tooltips ou futura visualização)
}: {
  approvalsCount?: number;
  notificationsCount?: number;
  ptsTodayCount?: number;
  ptsNext7Count?: number;
}) {
  const path = usePathname();
  const { collapsed, peek, isMobile, closeMobile, toggleCollapse } = useSidebar();
  const effectiveCollapsed = isMobile ? false : collapsed;
  const isRail = !isMobile && collapsed && !peek;
  const showLabels = !effectiveCollapsed || peek;

  const admin: Nav[] = [
    { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <CheckCircleOutlined />, activePrefix: '/dashboard/admin/approvals', badge: approvalsCount },
    { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <GroupOutlined />, activePrefix: '/dashboard/admin/users' },
  ];
  const gestao: Nav[] = [
    { href: '/dashboard/admin/exercises', label: 'Biblioteca', icon: <LibraryBooksOutlined />, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans', label: 'Planos', icon: <ListAltOutlined />, activePrefix: '/dashboard/admin/plans' },
    // badge mostra Hoje; next7 fica disponível para futura UX (ex.: tooltip)
    { href: '/dashboard/admin/pts-schedule', label: 'Agenda PTs', icon: <CalendarMonthOutlined />, activePrefix: '/dashboard/admin/pts-schedule', badge: ptsTodayCount },
  ];
  const definicoes: Nav[] = [
    {
      href: '/dashboard/admin/audit-log',
      label: 'Auditoria',
      icon: <PolicyOutlined />,
      activePrefix: '/dashboard/admin/audit-log',
    },
    {
      href: '/dashboard/admin/notifications',
      label: 'Notificações',
      icon: <NotificationsOutlined />,
      activePrefix: '/dashboard/admin/notifications',
      badge: notificationsCount,
    },
    {
      href: '/dashboard/settings',
      label: 'Definições',
      icon: <SettingsOutlined />,
      activePrefix: '/dashboard/settings',
    },
  ];

  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25, minWidth: 0, p: 1.5 }}>
      {!isRail && (
        <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: 0.6 }}>
          Navegação
        </Typography>
      )}
      {!isMobile && (
        <IconButton
          onClick={toggleCollapse}
          sx={{
            ml: 'auto',
            width: 32,
            height: 32,
            borderRadius: 1.25,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      )}
    </Box>
  );

  function renderSection(title: string, items: Nav[]) {
    return (
      <React.Fragment key={title}>
        {showLabels && (
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

            const icon = (it.badge ?? 0) > 0
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
                aria-label={isRail ? it.label : undefined}
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
                    minWidth: showLabels ? 36 : 0,
                    mr: showLabels ? 1 : 0,
                    justifyContent: 'center',
                    color: active ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {icon}
                </ListItemIcon>
                {showLabels && (
                  <ListItemText
                    primary={it.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, noWrap: true }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <React.Fragment key={it.href}>
                {isRail ? (
                  <Tooltip
                    title={it.label + (it.badge ? ` • Hoje: ${it.badge}${ptsNext7Count ? ` • Próx.7: ${ptsNext7Count}` : ''}` : '')}
                    placement="right"
                    arrow
                    disableInteractive
                  >
                    {Button}
                  </Tooltip>
                ) : (
                  Button
                )}
              </React.Fragment>
            );
          })}
        </List>
        {!isRail && <Divider sx={{ my: 1 }} />}
      </React.Fragment>
    );
  }

  return (
    <SidebarBase header={header}>
      {renderSection('Administração', [
        { href: '/dashboard/admin', label: 'Painel', icon: <DashboardOutlined />, exact: true, activePrefix: '/dashboard/admin' },
        ...admin,
      ])}
      {renderSection('Gestão', gestao)}
      {renderSection('Definições', definicoes)}
    </SidebarBase>
  );
}
