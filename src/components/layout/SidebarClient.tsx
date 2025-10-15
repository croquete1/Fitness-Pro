'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { SidebarNavSection, type SidebarNavItem } from '@/components/layout/SidebarNav';

type Props = {
  messagesCount?: number;
  notificationsCount?: number;
};

export default function SidebarClient({ messagesCount = 0, notificationsCount = 0 }: Props) {
  const path = usePathname();
  const { collapsed, peek, isMobile, closeMobile } = useSidebar();
  const isRail = !isMobile && collapsed && !peek;

  const handleNavigate = React.useCallback(() => {
    if (isMobile) closeMobile();
  }, [closeMobile, isMobile]);

  const painel: SidebarNavItem[] = [
    { href: '/dashboard/clients', label: 'Painel', icon: 'dashboard', exact: true, activePrefix: '/dashboard/clients' },
  ];

  const treino: SidebarNavItem[] = [
    { href: '/dashboard/my-plan', label: 'Os meus planos', icon: 'plans', activePrefix: '/dashboard/my-plan' },
    { href: '/dashboard/sessions', label: 'Sessões', icon: 'calendar', activePrefix: '/dashboard/sessions' },
  ];

  const comunicacao: SidebarNavItem[] = [
    { href: '/dashboard/messages', label: 'Mensagens', icon: 'messages', activePrefix: '/dashboard/messages', badge: messagesCount },
    { href: '/dashboard/notifications', label: 'Notificações', icon: 'notifications', activePrefix: '/dashboard/notifications', badge: notificationsCount },
  ];

  const conta: SidebarNavItem[] = [
    { href: '/dashboard/history', label: 'Histórico', icon: 'history', activePrefix: '/dashboard/history' },
    { href: '/dashboard/profile', label: 'Perfil', icon: 'profile', activePrefix: '/dashboard/profile' },
    { href: '/dashboard/settings', label: 'Definições', icon: 'settings', activePrefix: '/dashboard/settings' },
  ];

  return (
    <SidebarBase header={<span className="nav-heading">Acesso rápido</span>}>
      <nav className="fp-nav" aria-label="Menu do cliente">
        <SidebarNavSection title="Painel" items={painel} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Treino" items={treino} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Comunicação" items={comunicacao} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Conta" items={conta} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
      </nav>
    </SidebarBase>
  );
}
