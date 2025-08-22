// src/components/layout/SidebarClient.tsx
'use client';
import SidebarBase, { NavGroup } from './SidebarBase';
import { IconDashboard, IconCalendar, IconBilling, IconClient } from '@/components/icons/sidebar';

export default function SidebarClient() {
  const groups: NavGroup[] = [
    {
      title: 'Geral',
      items: [
        { href: '/dashboard/client', label: 'Dashboard', icon: <IconDashboard /> },
        { href: '/dashboard/client/plan', label: 'O meu plano', icon: <IconClient /> },
        { href: '/dashboard/client/schedule', label: 'Agenda', icon: <IconCalendar /> },
      ],
    },
    { title: 'Pagamentos', items: [{ href: '/dashboard/billing', label: 'Faturação', icon: <IconBilling /> }] },
  ];

  return (
    <SidebarBase
      brand={{ name: 'Fitness Pro', sub: 'Cliente', href: '/dashboard/client', logoSrc: '/logo.svg' }}
      groups={groups}
    />
  );
}
