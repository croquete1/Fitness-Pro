'use client';

import type { Route } from 'next';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarPT({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    {
      href: '/dashboard/pt' as Route,
      label: 'Painel',
      icon: <span aria-hidden>📊</span>,
      activePrefix: '/dashboard/pt',
    },
    {
      href: '/dashboard/pt/clients' as Route,
      label: 'Clientes',
      icon: <span aria-hidden>🧑‍🤝‍🧑</span>,
      activePrefix: '/dashboard/pt/clients',
    },
    {
      href: '/dashboard/pt/plans' as Route,
      label: 'Planos',
      icon: <span aria-hidden>📝</span>,
      activePrefix: '/dashboard/pt/plans',
    },
    {
      href: '/dashboard/pt/sessions/calendar' as Route,
      label: 'Calendário',
      icon: <span aria-hidden>📅</span>,
      activePrefix: '/dashboard/pt/sessions',
    },
    {
      href: '/dashboard/pt/settings' as Route,
      label: 'Definições',
      icon: <span aria-hidden>⚙️</span>,
      activePrefix: '/dashboard/pt/settings',
    },
  ];

  return <SidebarBase items={items} userLabel={userLabel} />;
}
