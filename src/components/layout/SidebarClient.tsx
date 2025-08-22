'use client';

import React from 'react';
import SidebarBase, { NavGroup } from './SidebarBase';

const Ic = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" />
    </svg>
  ),
  Plan: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  Billing: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M7 15h3" />
    </svg>
  ),
};

export default function SidebarClient() {
  const groups: NavGroup[] = [
    {
      title: 'Geral',
      items: [
        { href: '/dashboard/client', label: 'Dashboard', icon: <Ic.Dashboard /> },
        { href: '/dashboard/client/plan', label: 'O meu plano', icon: <Ic.Plan /> },
      ],
    },
    {
      title: 'Faturação',
      items: [{ href: '/dashboard/billing', label: 'Faturação', icon: <Ic.Billing /> }],
    },
  ];

  return (
    <SidebarBase
      brand={{ name: 'Fitness Pro', sub: 'Cliente', href: '/dashboard/client', logoSrc: '/logo.svg' }}
      groups={groups}
    />
  );
}
