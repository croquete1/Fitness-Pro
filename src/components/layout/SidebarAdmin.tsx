m// src/components/layout/SidebarAdmin.tsx
'use client';

import * as React from 'react';
import * as Ic from '@/components/ui/Icons'; // adapta ao teu path real de ícones
import { toAppRole, isAdmin } from '@/lib/roles';

type NavItem = { label: string; href: string; icon?: React.ReactNode };

export default function SidebarAdmin({ user }: { user: { role: unknown } }) {
  const role = toAppRole((user as any)?.role);

  const nav: NavItem[] = [
    { label: 'Clientes & Pacotes', href: '/dashboard/admin/clients', icon: <Ic.Receipt /> },
    { label: 'Planos de treino',   href: '/dashboard/pt/plans',      icon: <Ic.Home /> },
    // Admin extra (usa spread condicional em vez de JSX solto)
    ...(isAdmin(role) ? [{ label: 'Planos (Admin)', href: '/dashboard/admin/plans', icon: <Ic.Home /> }] : []),
  ];

  return (
    <nav aria-label="Admin">
      <ul className="sidebar-list">
        {nav.map((i) => (
          <li key={i.href}>
            <a className="nav-link" href={i.href}>
              {i.icon} <span>{i.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}