// src/components/layout/SidebarPT.tsx
'use client';
import SidebarBase, { NavGroup } from './SidebarBase';
import { IconDashboard, IconCalendar, IconBilling, IconDumbbell, IconUsers } from '@/components/icons/sidebar';

export default function SidebarPT() {
  const groups: NavGroup[] = [
    {
      title: 'Geral',
      items: [
        { href: '/dashboard/pt', label: 'Dashboard', icon: <IconDashboard /> },
        { href: '/dashboard/pt/schedule', label: 'Agenda', icon: <IconCalendar /> },
      ],
    },
    {
      title: 'Treino',
      items: [
        { href: '/dashboard/pt/clients', label: 'Clientes', icon: <IconUsers /> },
        { href: '/dashboard/pt/plans', label: 'Planos', icon: <IconDumbbell /> },
      ],
    },
    // (se não quiseres mostrar a todos os PT, podes esconder este item a partir da página com base na allowlist)
    { title: 'Pagamentos', items: [{ href: '/dashboard/billing', label: 'Faturação', icon: <IconBilling /> }] },
  ];

  return (
    <SidebarBase
      brand={{ name: 'Fitness Pro', sub: 'PT', href: '/dashboard/pt', logoSrc: '/logo.svg' }}
      groups={groups}
    />
  );
}
