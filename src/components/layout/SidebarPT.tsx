'use client';

import type { Route } from 'next';
import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarPT({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/pt' as Route, label: 'Início', icon: '🏠' },
    { href: '/dashboard/pt/clients' as Route, label: 'Clientes', icon: '🧑‍🤝‍🧑' },
    { href: '/dashboard/pt/plans' as Route, label: 'Planos', icon: '📝' },
    { href: '/dashboard/pt/sessions/calendar' as Route, label: 'Calendário', icon: '📅' },
    { href: '/dashboard/pt/settings' as Route, label: 'Definições', icon: '⚙️' },
  ];

  return <SidebarBase items={items} userLabel={userLabel} />;
}
