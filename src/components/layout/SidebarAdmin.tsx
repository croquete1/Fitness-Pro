// src/components/layout/SidebarAdmin.tsx
'use client';

import React from 'react';
import SidebarBase, { type SidebarItem } from './SidebarBase';

export default function SidebarAdmin({ userLabel }: { userLabel: string }) {
  const items: SidebarItem[] = [
    { href: '/dashboard/admin',            label: 'Painel',       icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/admin' },
    { href: '/dashboard/admin/approvals',  label: 'Aprovações',   icon: <span aria-hidden>✅</span>, activePrefix: '/dashboard/admin/approvals' },
    { href: '/dashboard/admin/users',      label: 'Utilizadores', icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/admin/users' },
    { href: '/dashboard/admin/exercises',  label: 'Exercícios',   icon: <span aria-hidden>🏋️</span>, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans',      label: 'Planos',       icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/admin/plans' },
    { href: '/dashboard/search',           label: 'Pesquisar',    icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
  ];

  const header = (
    <div className="fp-sb-head">
      <div className="fp-sb-brand">
        <button className="logo" aria-label="Fitness Pro">💪</button>
        <div>
          <div className="brand-name" style={{ fontWeight: 800 }}>Fitness Pro</div>
          <div className="small text-muted" title={userLabel} style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userLabel}
          </div>
        </div>
      </div>
      {/* espaço para botões rápidos, se precisares */}
      <div className="fp-sb-actions" />
    </div>
  );

  return <SidebarBase items={items} header={header} />;
}
