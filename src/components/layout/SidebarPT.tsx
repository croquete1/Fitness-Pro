// src/components/layout/SidebarPT.tsx
import type { Route } from 'next';
import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarPT({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/pt' as Route, label: 'Início',    emoji: '🏠' },
    { href: '/dashboard/pt/clients' as Route, label: 'Clientes', emoji: '🧑‍🤝‍🧑' },
    { href: '/dashboard/pt/plans' as Route, label: 'Planos',   emoji: '📝' },
    { href: '/dashboard/pt/sessions/calendar' as Route, label: 'Agenda',  emoji: '📅' },
    { href: '/dashboard/pt/settings/folgas' as Route, label: 'Folgas',  emoji: '🌴' },
    { href: '/dashboard/pt/settings/locations' as Route, label: 'Locais',  emoji: '📍' },
    { href: '/dashboard/search' as Route, label: 'Pesquisar', emoji: '🔎' },
  ];
  return <SidebarBase userLabel={userLabel} items={items} />;
}
