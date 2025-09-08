'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarAdmin({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/admin',           label: 'Painel',       icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/admin' },
    { href: '/dashboard/admin/approvals', label: 'Aprovações',   icon: <span aria-hidden>✅</span>, activePrefix: '/dashboard/admin/approvals' },
    { href: '/dashboard/admin/users',     label: 'Utilizadores', icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/admin/users' },
    { href: '/dashboard/admin/exercises', label: 'Exercícios',   icon: <span aria-hidden>🏋️</span>, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans',     label: 'Planos',       icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/admin/plans' },
    { href: '/dashboard/search',          label: 'Pesquisar',    icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    { href: '/dashboard/settings',        label: 'Definições',   icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
  ];
  return <SidebarBase items={items} userLabel={userLabel} />;
}
