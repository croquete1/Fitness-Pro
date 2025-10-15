'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import SidebarBase from '@/components/layout/SidebarBase';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { SidebarNavSection, type SidebarNavItem } from '@/components/layout/SidebarNav';

export default function SidebarAdmin({
  approvalsCount = 0,
  notificationsCount = 0,
  ptsTodayCount = 0,
}: {
  approvalsCount?: number;
  notificationsCount?: number;
  ptsTodayCount?: number;
}) {
  const path = usePathname();
  const { collapsed, peek, isMobile, closeMobile } = useSidebar();
  const isRail = !isMobile && collapsed && !peek;
  const handleNavigate = React.useCallback(() => {
    if (isMobile) closeMobile();
  }, [closeMobile, isMobile]);

  const admin: SidebarNavItem[] = [
    { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: 'check-circle', activePrefix: '/dashboard/admin/approvals', badge: approvalsCount },
    { href: '/dashboard/admin/users', label: 'Utilizadores', icon: 'users', activePrefix: '/dashboard/admin/users' },
  ];

  const gestao: SidebarNavItem[] = [
    { href: '/dashboard/admin/exercises', label: 'Biblioteca', icon: 'library', activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans', label: 'Planos', icon: 'plans', activePrefix: '/dashboard/admin/plans' },
    { href: '/dashboard/admin/pts-schedule', label: 'Agenda PTs', icon: 'calendar', activePrefix: '/dashboard/admin/pts-schedule', badge: ptsTodayCount },
  ];

  const sistema: SidebarNavItem[] = [
    { href: '/dashboard/system', label: 'Centro de controlo', icon: 'system', activePrefix: '/dashboard/system', exact: true },
    { href: '/dashboard/system/health', label: 'Saúde do sistema', icon: 'tools', activePrefix: '/dashboard/system/health' },
    { href: '/dashboard/system/metrics', label: 'Métricas', icon: 'metrics', activePrefix: '/dashboard/system/metrics' },
    { href: '/dashboard/system/logs', label: 'Logs e auditoria', icon: 'terminal', activePrefix: '/dashboard/system/logs' },
  ];

  const definicoes: SidebarNavItem[] = [
    { href: '/dashboard/admin/audit-log', label: 'Auditoria', icon: 'shield', activePrefix: '/dashboard/admin/audit-log' },
    { href: '/dashboard/admin/notifications', label: 'Notificações', icon: 'notifications', activePrefix: '/dashboard/admin/notifications', badge: notificationsCount },
    { href: '/dashboard/settings', label: 'Definições', icon: 'settings', activePrefix: '/dashboard/settings' },
  ];

  return (
    <SidebarBase
      header={<span className="nav-heading">Navegação</span>}
    >
      <nav className="fp-nav" aria-label="Menu administrador">
        <SidebarNavSection title="Administração" items={[{ href: '/dashboard/admin', label: 'Painel', icon: 'dashboard', exact: true, activePrefix: '/dashboard/admin' }, ...admin]} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Gestão" items={gestao} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Sistema" items={sistema} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
        <SidebarNavSection title="Definições" items={definicoes} currentPath={path} isRail={isRail} onNavigate={handleNavigate} />
      </nav>
    </SidebarBase>
  );
}
