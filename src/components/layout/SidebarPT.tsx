'use client';

import React from 'react';
import SidebarBase, { NavGroup } from './SidebarBase';

const Ic = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Plans: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  ),
  Billing: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M7 15h3" />
    </svg>
  ),
};

export default function SidebarPT() {
  const groups: NavGroup[] = [
    {
      title: 'Geral',
      items: [
        { href: '/dashboard/pt', label: 'Dashboard', icon: <Ic.Dashboard /> },
        { href: '/dashboard/pt/clients', label: 'Clientes', icon: <Ic.Users /> },
        { href: '/dashboard/pt/plans', label: 'Planos', icon: <Ic.Plans /> },
      ],
    },
    {
      title: 'Faturação',
      items: [{ href: '/dashboard/billing', label: 'Faturação', icon: <Ic.Billing /> }],
    },
  ];

  return (
    <SidebarBase
      brand={{ name: 'Fitness Pro', sub: 'Treinador', href: '/dashboard/pt', logoSrc: '/logo.svg' }}
      groups={groups}
    />
  );
}
