/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import SidebarBase, { NavGroup } from './SidebarBase';
import { hasBillingAccess } from '@/lib/roles';

// Ícones (SVG inline)
const Ic = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Receipt: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      {/* user 1 */}
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 18c0-3 3-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* user 2 (traseiro) */}
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M14.5 18c.4-2.2 2.4-3.7 4.5-3.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default function SidebarPT() {
  const { data: session } = useSession();

  const brand = (
    <>
      <img className="logo" src="/logo.png" alt="" width={28} height={28} />
      <span className="brand-text">
        <span className="brand-name">Fitness Pro</span>
        <span className="brand-sub">Personal Trainer</span>
      </span>
    </>
  );

  const groups: NavGroup[] = [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', href: '/dashboard/pt', icon: <Ic.Home /> },
      ],
    },
    {
      title: 'Clientes',
      items: [
        { label: 'Clientes', href: '/dashboard/pt/clients', icon: <Ic.Users /> },
        { label: 'Planos de treino', href: '/dashboard/pt/plans', icon: <Ic.Receipt /> },
      ],
    },
  ];

  // Faturação só se permitido (admin ou PT em allowlist)
  if (hasBillingAccess(session?.user as any)) {
    groups.push({
      title: 'Faturação',
      items: [{ label: 'Pagamentos', href: '/dashboard/billing', icon: <Ic.Receipt /> }],
    });
  }

  return <SidebarBase brand={brand} groups={groups} />;
}
