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
  hint?: string;
};

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  hint?: string;
};

type FlowStep = {
  href: string;
  title: string;
  description: string;
};

type Props = {
  messagesCount?: number;
  notificationsCount?: number;
};

export default function SidebarPT({ messagesCount = 0, notificationsCount = 0 }: Props) {
  const path = usePathname();
  const { collapsed, peek, isMobile, closeMobile, toggleCollapse } = useSidebar();
  const effectiveCollapsed = isMobile ? false : collapsed;
  const isRail = !isMobile && collapsed && !peek;
  const showLabels = !effectiveCollapsed || peek;

  const overview: Nav[] = [
    {
      href: '/dashboard/pt',
      label: 'Painel',
      icon: <DashboardOutlined />,
      exact: true,
      activePrefix: '/dashboard/pt',
      hint: 'Resumo diário das tarefas e métricas chave do teu trabalho.',
    },
    {
      href: '/dashboard/pt/schedule',
      label: 'Agenda',
      icon: <CalendarMonthOutlined />,
      activePrefix: '/dashboard/pt/schedule',
      hint: 'Consulta sessões e eventos futuros num só calendário.',
    },
  ];

  const clientes: Nav[] = [
    {
      href: '/dashboard/pt/clients',
      label: 'Clientes',
      icon: <GroupOutlined />,
      activePrefix: ['/dashboard/pt/clients'],
      hint: 'Escolhe um cliente para ver progresso, planos ativos e notas.',
    },
    {
      href: '/dashboard/pt/training-plans',
      label: 'Planos ativos',
      icon: <AssignmentTurnedInOutlined />,
      activePrefix: ['/dashboard/pt/training-plans'],
      hint: 'Acompanha todos os planos ativos e o estado de cada um.',
    },
    {
      href: '/dashboard/pt/plans',
      label: 'Planeador semanal',
      icon: <ViewWeekOutlined />,
      activePrefix: ['/dashboard/pt/plans'],
      hint: 'Organiza a semana com uma visão por dias e blocos de treino.',
    },
  ];

  const biblioteca: Nav[] = [
    {
      href: '/dashboard/pt/library',
      label: 'Biblioteca',
      icon: <MenuBookOutlined />,
      activePrefix: ['/dashboard/pt/library'],
      hint: 'Centraliza recursos, modelos e conteúdos de apoio ao treino.',
    },
    {
      href: '/dashboard/pt/workouts',
      label: 'Treinos',
      icon: <FitnessCenterOutlined />,
      activePrefix: ['/dashboard/pt/workouts'],
      hint: 'Explora treinos guardados para reutilizar em novos planos.',
    },
  ];

  const comunicacao: Nav[] = [
    {
      href: '/dashboard/pt/messages',
      label: 'Mensagens',
      icon: <ChatBubbleOutline />,
      activePrefix: ['/dashboard/pt/messages'],
      badge: messagesCount,
      hint: 'Fala com clientes e acompanha conversas em curso.',
    },
    {
      href: '/dashboard/notifications',
      label: 'Notificações',
      icon: <NotificationsOutlined />,
      activePrefix: ['/dashboard/notifications'],
      badge: notificationsCount,
      hint: 'Alertas importantes sobre planos, sessões e pagamentos.',
    },
  ];

  const conta: Nav[] = [
    {
      href: '/dashboard/history',
      label: 'Histórico',
      icon: <HistoryOutlined />,
      activePrefix: ['/dashboard/history'],
      hint: 'Exporta dados e revê registos de atividade anteriores.',
    },
    {
      href: '/dashboard/profile',
      label: 'Perfil',
      icon: <AccountCircleOutlined />,
      activePrefix: ['/dashboard/profile'],
      hint: 'Atualiza dados pessoais e informação profissional.',
    },
    {
      href: '/dashboard/settings',
      label: 'Definições',
      icon: <SettingsOutlined />,
      activePrefix: ['/dashboard/settings'],
      hint: 'Configura notificações, preferências e integrações.',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      href: '/dashboard/pt/plans/new',
      label: 'Criar plano',
      description: 'Começa um novo plano do zero',
      icon: <AddCircleOutline fontSize="small" />,
      hint: 'Segue o formulário orientado para definir metas, blocos e sessões.',
    },
    {
      href: '/dashboard/pt/sessions/new',
      label: 'Agendar sessão',
      description: 'Marca rapidamente uma sessão avulsa',
      icon: <EventAvailableOutlined fontSize="small" />,
      hint: 'Regista uma sessão individual sem sair da agenda.',
    },
  ];

  const planWizardSteps: FlowStep[] = [
    {
      href: '/dashboard/pt/clients',
      title: '1. Escolhe o cliente',
      description: 'Seleciona o atleta com quem vais trabalhar e revê o histórico.',
    },
    {
      href: '/dashboard/pt/plans/new',
      title: '2. Define objetivos',
      description: 'Utiliza o formulário guiado para definir metas e blocos por dia.',
    },
    {
      href: '/dashboard/pt/plans',
      title: '3. Ajusta o calendário',
      description: 'Organiza os dias de treino, arrasta blocos e confirma sequência.',
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

    if (isRail || it.hint) {
      return (
        <Tooltip
          key={it.href}
          title={
            <Box sx={{ display: 'grid', gap: 0.25 }}>
              <Typography variant="subtitle2" fontSize={13} fontWeight={700}>
                {it.label}
              </Typography>
              {it.hint && (
                <Typography variant="caption" fontSize={11} sx={{ opacity: 0.85 }}>
                  {it.hint}
                </Typography>
              )}
            </Box>
          }
          placement="right"
          arrow
          disableInteractive
        >
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

            return isRail || action.hint ? (
              <Tooltip
                key={action.href}
                title={
                  <Box sx={{ display: 'grid', gap: 0.25 }}>
                    <Typography variant="subtitle2" fontSize={13} fontWeight={700}>
                      {action.label}
                    </Typography>
                    <Typography variant="caption" fontSize={11} sx={{ opacity: 0.85 }}>
                      {action.hint ?? action.description}
                    </Typography>
                  </Box>
                }
                placement="right"
                arrow
                disableInteractive
              >
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

  const renderGuidedFlow = (steps: FlowStep[]) => {
    if (!steps.length) return null;

    return (
      <Box sx={{ display: 'grid', gap: 0.75, px: 1.5, py: showLabels ? 1.5 : 1 }}>
        {showLabels && (
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            Guia rápido
          </Typography>
        )}
        <Box component="nav" sx={{ display: 'grid', gap: 0.5 }} aria-label="Guia rápido: plano personalizado">
          {steps.map((step, index) => {
            const content = (
              <ListItemButton
                key={step.href}
                component={Link}
                href={step.href}
                prefetch={false}
                onClick={() => { if (isMobile) closeMobile(); }}
                aria-label={isRail ? step.title : undefined}
                sx={{
                  alignItems: showLabels ? 'flex-start' : 'center',
                  borderRadius: 1.5,
                  minHeight: 44,
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                {showLabels && (
                  <ListItemText
                    primary={step.title}
                    secondary={step.description}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: 12, color: 'text.secondary' }}
                  />
                )}
              </ListItemButton>
            );

            if (isRail) {
              return (
                <Tooltip
                  key={step.href}
                  title={
                    <Box sx={{ display: 'grid', gap: 0.25 }}>
                      <Typography variant="subtitle2" fontSize={13} fontWeight={700}>
                        {step.title}
                      </Typography>
                      <Typography variant="caption" fontSize={11} sx={{ opacity: 0.85 }}>
                        {step.description}
                      </Typography>
                    </Box>
                  }
                  placement="right"
                  arrow
                  disableInteractive
                >
                  {content}
                </Tooltip>
              );
            }

            return content;
          })}
        </Box>
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
        {renderGuidedFlow(planWizardSteps)}
        {renderQuickActions(quickActions)}
      </Box>
    </SidebarBase>
  );
}

function asArray(value?: string | string[]) {
  if (!value) return [] as string[];
  return Array.isArray(value) ? value : [value];
}
