// src/components/layout/SidebarAdmin.tsx
'use client';

import React from 'react';
import type { Route } from 'next';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarAdmin({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/admin' as Route,           label: 'Painel',       icon: <span aria-hidden="true">📊</span>, activePrefix: '/dashboard/admin' },
    { href: '/dashboard/admin/approvals' as Route, label: 'Aprovações',   icon: <span aria-hidden="true">✅</span>, activePrefix: '/dashboard/admin/approvals' },
    { href: '/dashboard/admin/users' as Route,     label: 'Utilizadores', icon: <span aria-hidden="true">🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/admin/users' },
    { href: '/dashboard/admin/exercises' as Route, label: 'Exercícios',   icon: <span aria-hidden="true">🏋️</span>, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans' as Route,     label: 'Planos',       icon: <span aria-hidden="true">📝</span>, activePrefix: '/dashboard/admin/plans' },
    { href: '/dashboard/search' as Route,          label: 'Pesquisar',    icon: <span aria-hidden="true">🔎</span>, activePrefix: '/dashboard/search' },
  ];

  const header = (
    <div className="fp-sb-head">
      <div className="fp-sb-brand">
        <button className="logo" aria-label="Fitness Pro">💪</button>
        <div>
          <div className="brand-name" style={{ fontWeight: 800 }}>Fitness Pro</div>
          <div
            className="small text-muted"
            title={userLabel}
            style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {userLabel}
          </div>
        </div>
      </div>
      <div className="fp-sb-actions" />
    </div>
  );

  return <SidebarBase items={items} userLabel={userLabel} header={header} />;
}
