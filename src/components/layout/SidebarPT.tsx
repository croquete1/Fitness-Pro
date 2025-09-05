// src/components/layout/SidebarPT.tsx
'use client';

import React from 'react';
import SidebarBase, { type SidebarItem } from './SidebarBase';

export default function SidebarPT({ userLabel }: { userLabel: string }) {
  // Rotas existentes (evitamos 404/typed-route errors)
  const items: SidebarItem[] = [
    { href: '/dashboard/pt',          label: 'Carteira',   icon: <span aria-hidden>💼</span>, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/clients',  label: 'Clientes',   icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/pt/clients' },
    { href: '/dashboard/pt/plans',    label: 'Planos',     icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/pt/plans' },
    { href: '/dashboard/search',      label: 'Pesquisar',  icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
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

  return <SidebarBase items={items} header={header} />;
}
