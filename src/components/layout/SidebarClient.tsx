'use client';

import type { Route } from 'next';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarClient({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    {
      href: '/dashboard/clients' as Route, // tua “home” de cliente
      label: 'Painel',
      icon: <span aria-hidden>🏠</span>,
      activePrefix: '/dashboard/clients',
    },
    {
      href: '/dashboard/my-plan' as Route,
      label: 'Meu plano',
      icon: <span aria-hidden>📒</span>,
      activePrefix: '/dashboard/my-plan',
    },
    {
      href: '/dashboard/sessions' as Route,
      label: 'Sessões',
      icon: <span aria-hidden>📅</span>,
      activePrefix: '/dashboard/sessions',
    },
    {
      href: '/dashboard/messages' as Route,
      label: 'Mensagens',
      icon: <span aria-hidden>💬</span>,
      activePrefix: '/dashboard/messages',
    },
    {
      href: '/dashboard/profile' as Route,
      label: 'Perfil',
      icon: <span aria-hidden>👤</span>,
      activePrefix: '/dashboard/profile',
    },
  ];

  return <SidebarBase items={items} userLabel={userLabel} />;
}
