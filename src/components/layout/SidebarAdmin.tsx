'use client';

import type { Route } from 'next';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarAdmin({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    {
      href: '/dashboard/admin' as Route,
      label: 'Painel',
      icon: <span aria-hidden>📊</span>,
      activePrefix: '/dashboard/admin',
    },
    {
      href: '/dashboard/admin/approvals' as Route,
      label: 'Aprovações',
      icon: <span aria-hidden>✅</span>,
      activePrefix: '/dashboard/admin/approvals',
    },
    {
      href: '/dashboard/admin/users' as Route,
      label: 'Utilizadores',
      icon: <span aria-hidden>🧑‍🤝‍🧑</span>,
      activePrefix: '/dashboard/admin/users',
    },
    {
      href: '/dashboard/admin/exercises' as Route,
      label: 'Exercícios',
      icon: <span aria-hidden>🏋️</span>,
      activePrefix: '/dashboard/admin/exercises',
    },
    {
      href: '/dashboard/admin/plans' as Route,
      label: 'Planos',
      icon: <span aria-hidden>📝</span>,
      activePrefix: '/dashboard/admin/plans',
    },
    {
      href: '/dashboard/search' as Route,
      label: 'Pesquisar',
      icon: <span aria-hidden>🔎</span>,
      activePrefix: '/dashboard/search',
    },
  ];

  return <SidebarBase items={items} userLabel={userLabel} />;
}
