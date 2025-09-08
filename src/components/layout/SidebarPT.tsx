'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarPT({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/pt',                    label: 'Painel',     icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/clients',           label: 'Clientes',   icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/pt/clients' },
    { href: '/dashboard/pt/plans',             label: 'Planos',     icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/pt/plans' },
    { href: '/dashboard/pt/sessions/calendar', label: 'Calendário', icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/pt/sessions' },
    { href: '/dashboard/search',               label: 'Pesquisar',  icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    { href: '/dashboard/pt/settings',          label: 'Definições', icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/pt/settings' },
  ];
  return <SidebarBase items={items} userLabel={userLabel} />;
}
