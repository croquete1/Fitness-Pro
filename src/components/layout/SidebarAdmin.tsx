/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import SidebarBase, { NavGroup } from './SidebarBase';

// Ícones leves (inline SVG)
const Ic = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  CheckSquare: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M15 11a3 3 0 1 0 0-6" stroke="currentColor" strokeWidth="2" />
      <path d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="2" />
      <path d="M21 19c0-2.21-1.343-4.105-3.25-4.778" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Receipt: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default function SidebarAdmin() {
  const brand = (
    <>
      <img className="logo" src="/logo.png" alt="" width={28} height={28} />
      <span className="brand-text">
        <span className="brand-name">Fitness Pro</span>
        <span className="brand-sub">Admin</span>
      </span>
    </>
  );

  const groups: NavGroup[] = [
    {
      title: 'GERAL',
      items: [{ label: 'Dashboard', href: '/dashboard', icon: <Ic.Home /> }],
    },
    {
  title: 'Administração',
  items: [
    { label: 'Aprovações', href: '/dashboard/admin/approvals', icon: <Ic.CheckSquare /> },
    { label: 'Utilizadores', href: '/dashboard/admin/users', icon: <Ic.Users /> },
    // NOVO: carteira
    { label: 'Clientes & Pacotes', href: '/dashboard/admin/clients', icon: <Ic.Receipt /> },
    // NOVO: planos
    { label: 'Planos de treino', href: '/dashboard/pt/plans', icon: <Ic.Home /> },
  ],
},
    {
      title: 'FATURAÇÃO',
      items: [
        // rota existente de pagamentos
        { label: 'Pagamentos', href: '/dashboard/billing', icon: <Ic.Receipt /> },
      ],
    },
  ];

  return <SidebarBase brand={brand} groups={groups} />;
}
