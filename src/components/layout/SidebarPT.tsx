'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { SidebarNavSection, type SidebarNavItem } from '@/components/layout/SidebarNav';
import { NavIcon } from '@/components/layout/icons';

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: string;
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
  const { collapsed, peek, isMobile, closeMobile } = useSidebar();
  const isRail = !isMobile && collapsed && !peek;

  const handleNavigate = React.useCallback(() => {
    if (isMobile) closeMobile();
  }, [closeMobile, isMobile]);

  const overview: SidebarNavItem[] = [
    { href: '/dashboard/pt', label: 'Painel', icon: 'dashboard', exact: true, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/schedule', label: 'Agenda', icon: 'calendar', activePrefix: '/dashboard/pt/schedule' },
  ];

  const clientes: SidebarNavItem[] = [
    { href: '/dashboard/pt/clients', label: 'Clientes', icon: 'users', activePrefix: ['/dashboard/pt/clients'] },
    { href: '/dashboard/pt/training-plans', label: 'Planos ativos', icon: 'plans', activePrefix: ['/dashboard/pt/training-plans'] },
    { href: '/dashboard/pt/plans', label: 'Planeador semanal', icon: 'calendar-plus', activePrefix: ['/dashboard/pt/plans'] },
  ];

  const biblioteca: SidebarNavItem[] = [
    { href: '/dashboard/pt/library', label: 'Biblioteca', icon: 'library', activePrefix: ['/dashboard/pt/library'] },
    { href: '/dashboard/pt/workouts', label: 'Treinos', icon: 'dumbbell', activePrefix: ['/dashboard/pt/workouts'] },
  ];

  const comunicacao: SidebarNavItem[] = [
    { href: '/dashboard/pt/messages', label: 'Mensagens', icon: 'messages', activePrefix: ['/dashboard/pt/messages'], badge: messagesCount },
    { href: '/dashboard/notifications', label: 'Notificações', icon: 'notifications', activePrefix: ['/dashboard/notifications'], badge: notificationsCount },
  ];

  const conta: SidebarNavItem[] = [
    { href: '/dashboard/history', label: 'Histórico', icon: 'history', activePrefix: ['/dashboard/history'] },
    { href: '/dashboard/profile', label: 'Perfil', icon: 'profile', activePrefix: ['/dashboard/profile'] },
    { href: '/dashboard/settings', label: 'Definições', icon: 'settings', activePrefix: ['/dashboard/settings'] },
  ];

  const quickActions: QuickAction[] = [
    {
      href: '/dashboard/pt/plans/new',
      label: 'Criar plano',
      description: 'Começa um novo plano guiado',
      icon: 'plus-circle',
    },
    {
      href: '/dashboard/pt/sessions/new',
      label: 'Agendar sessão',
      description: 'Marca uma sessão avulsa',
      icon: 'calendar-plus',
    },
  ];

  const planWizardSteps: FlowStep[] = [
    {
      href: '/dashboard/pt/clients',
      title: '1. Escolhe o cliente',
      description: 'Revisa progresso e notas antes de planear.',
    },
    {
      href: '/dashboard/pt/plans/new',
      title: '2. Define objetivos',
      description: 'Segue o assistente neo para estruturar blocos.',
    },
    {
      href: '/dashboard/pt/plans',
      title: '3. Ajusta o calendário',
      description: 'Afina sessões com arrastar-e-largar futurista.',
    },
  ];

  return (
    <SidebarBase header={<span className="nav-heading">Cockpit PT</span>}>
      <nav className="fp-nav" aria-label="Menu do personal trainer">
        <SidebarNavSection title="Overview" items={overview} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Clientes" items={clientes} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Biblioteca" items={biblioteca} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Comunicação" items={comunicacao} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Conta" items={conta} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
      </nav>

      <div className="sidebar-block">
        <span className="sidebar-block__title">Acções rápidas</span>
        <div className="sidebar-actions">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              prefetch={false}
              className="sidebar-action neo-surface neo-surface--interactive"
              onClick={handleNavigate}
            >
              <span className="sidebar-action__icon" aria-hidden>
                <NavIcon name={action.icon} size={18} />
              </span>
              <span className="sidebar-action__label">{action.label}</span>
              <span className="sidebar-action__hint">{action.description}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="sidebar-block">
        <span className="sidebar-block__title">Fluxo recomendado</span>
        <ol className="sidebar-steps">
          {planWizardSteps.map((step, index) => (
            <li key={step.href}>
              <Link
                href={step.href}
                prefetch={false}
                className="sidebar-step"
                onClick={handleNavigate}
              >
                <span className="sidebar-step__index" aria-hidden>{index + 1}</span>
                <span className="sidebar-step__body">
                  <span className="sidebar-step__title">{step.title}</span>
                  <span className="sidebar-step__desc">{step.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </SidebarBase>
  );
}
