'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  Typography,
} from '@mui/material';

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import FitnessCenterOutlined from '@mui/icons-material/FitnessCenterOutlined';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ViewWeekOutlined from '@mui/icons-material/ViewWeekOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import EventAvailableOutlined from '@mui/icons-material/EventAvailableOutlined';

import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';

type Nav = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  activePrefix?: string | string[];
  badge?: number;
};

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
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

  const overview: Nav[] = [
    { href: '/dashboard/pt', label: 'Painel', icon: <DashboardOutlined />, exact: true, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/schedule', label: 'Agenda', icon: <CalendarMonthOutlined />, activePrefix: '/dashboard/pt/schedule' },
  ];

  const clientes: Nav[] = [
    { href: '/dashboard/pt/clients', label: 'Clientes', icon: <GroupOutlined />, activePrefix: ['/dashboard/pt/clients'] },
    {
      href: '/dashboard/pt/training-plans',
      label: 'Planos ativos',
      icon: <AssignmentTurnedInOutlined />,
      activePrefix: ['/dashboard/pt/training-plans'],
    },
    {
      href: '/dashboard/pt/plans',
      label: 'Planeador semanal',
      icon: <ViewWeekOutlined />,
      activePrefix: ['/dashboard/pt/plans'],
    },
  ];

  const biblioteca: Nav[] = [
    {
      href: '/dashboard/pt/library',
      label: 'Biblioteca',
      icon: <MenuBookOutlined />,
      activePrefix: ['/dashboard/pt/library'],
    },
    {
      href: '/dashboard/pt/workouts',
      label: 'Treinos',
      icon: <FitnessCenterOutlined />,
      activePrefix: ['/dashboard/pt/workouts'],
    },
  ];

  const comunicacao: Nav[] = [
    {
      href: '/dashboard/pt/messages',
      label: 'Mensagens',
      icon: <ChatBubbleOutline />,
      activePrefix: ['/dashboard/pt/messages'],
      badge: messagesCount,
    },
    {
      href: '/dashboard/notifications',
      label: 'Notificações',
      icon: <NotificationsOutlined />,
      activePrefix: ['/dashboard/notifications'],
      badge: notificationsCount,
    },
  ];

  const conta: Nav[] = [
    { href: '/dashboard/history', label: 'Histórico', icon: <HistoryOutlined />, activePrefix: ['/dashboard/history'] },
    { href: '/dashboard/profile', label: 'Perfil', icon: <AccountCircleOutlined />, activePrefix: ['/dashboard/profile'] },
    { href: '/dashboard/settings', label: 'Definições', icon: <SettingsOutlined />, activePrefix: ['/dashboard/settings'] },
  ];

  const quickActions: QuickAction[] = [
    {
      href: '/dashboard/pt/plans/new',
      label: 'Criar plano',
      description: 'Começa um novo plano do zero',
      icon: <AddCircleOutline fontSize="small" />,
    },
    {
      href: '/dashboard/pt/sessions/new',
      label: 'Agendar sessão',
      description: 'Marca rapidamente uma sessão avulsa',
      icon: <EventAvailableOutlined fontSize="small" />,
    },
  ];

  const renderNavButton = (it: Nav) => {
    const prefixes = asArray(it.activePrefix);
    const active = it.exact
      ? path === it.href
      : prefixes.length > 0
        ? prefixes.some((prefix) => path.startsWith(prefix))
        : path === it.href || path.startsWith(`${it.href}/`);

    const iconNode = (it.badge ?? 0) > 0
      ? (
          <Badge color="error" badgeContent={it.badge} overlap="circular" max={99}>
            {it.icon as any}
          </Badge>
        )
      : it.icon;

    const button = (
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
          {iconNode}
        </ListItemIcon>
        {showLabels && (
          <ListItemText
            primary={it.label}
            primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500, noWrap: true }}
          />
        )}
      </ListItemButton>
    );

    if (isRail) {
      return (
        <Tooltip key={it.href} title={it.label} placement="right" arrow disableInteractive>
          {button}
        </Tooltip>
      );
    }

    return button;
  };

  const renderSection = (title: string, items: Nav[]) => (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      {showLabels && (
        <ListSubheader
          disableSticky
          sx={{
            bgcolor: 'transparent',
            color: 'text.secondary',
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            lineHeight: 1,
            px: 1.5,
            pt: 1.5,
            pb: 0.5,
          }}
        >
          {title}
        </ListSubheader>
      )}
      <List dense disablePadding sx={{ px: 0.5, display: 'grid', gap: 0.5 }}>
        {items.map(renderNavButton)}
      </List>
    </Box>
  );

  const renderQuickActions = (actions: QuickAction[]) => {
    if (!actions.length) return null;

    return (
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        {!isRail && <Divider sx={{ mx: 1.5, my: 0.5 }} />}
        {showLabels && (
          <ListSubheader
            disableSticky
            sx={{
              bgcolor: 'transparent',
              color: 'text.secondary',
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              lineHeight: 1,
              px: 1.5,
              pt: 1,
              pb: 0.5,
            }}
          >
            Ações rápidas
          </ListSubheader>
        )}
        <List disablePadding sx={{ px: 0.5, display: 'grid', gap: 0.5 }}>
          {actions.map((action) => {
            const button = (
              <ListItemButton
                key={action.href}
                component={Link}
                href={action.href}
                prefetch={false}
                onClick={() => { if (isMobile) closeMobile(); }}
                aria-label={isRail ? action.label : undefined}
                sx={{
                  borderRadius: 1.5,
                  alignItems: showLabels ? 'flex-start' : 'center',
                  minHeight: 44,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemText-primary': { fontWeight: 700 },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: showLabels ? 36 : 0,
                    mr: showLabels ? 1 : 0,
                    justifyContent: 'center',
                    color: 'inherit',
                  }}
                >
                  {action.icon}
                </ListItemIcon>
                {showLabels && (
                  <ListItemText
                    primary={action.label}
                    secondary={action.description}
                    primaryTypographyProps={{ fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12, sx: { color: 'inherit', opacity: 0.85 } }}
                  />
                )}
              </ListItemButton>
            );

            return isRail ? (
              <Tooltip key={action.href} title={action.label} placement="right" arrow disableInteractive>
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </List>
      </Box>
    );
  };

  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25, minWidth: 0, p: 1.5 }}>
      {!isRail && (
        <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: 0.6 }}>
          Área PT
        </Typography>
      )}
      <IconButton onClick={toggleCollapse} sx={{ ml: 'auto', width: 32, height: 32, borderRadius: 1.25, border: 1, borderColor: 'divider', bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </IconButton>
    </Box>
  );

  return (
    <SidebarBase header={header}>
      <Box sx={{ display: 'grid', gap: 0.5, pb: 1 }}>
        {[{ title: 'Painel', items: overview }, { title: 'Clientes', items: clientes }, { title: 'Conteúdos', items: biblioteca }, { title: 'Comunicação', items: comunicacao }, { title: 'Conta', items: conta }]
          .map((section, index, arr) => (
            <React.Fragment key={section.title}>
              {renderSection(section.title, section.items)}
              {!isRail && index < arr.length - 1 && <Divider sx={{ mx: 1.5, my: 0.5 }} />}
            </React.Fragment>
          ))}
        {renderQuickActions(quickActions)}
      </Box>
    </SidebarBase>
  );
}

function asArray(value?: string | string[]) {
  if (!value) return [] as string[];
  return Array.isArray(value) ? value : [value];
}
