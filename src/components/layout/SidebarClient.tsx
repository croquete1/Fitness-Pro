// src/components/layout/SidebarClient.tsx
'use client';

import React from 'react';
import SidebarBase, { type SidebarItem } from './SidebarBase';

export default function SidebarClient({ userLabel }: { userLabel: string }) {
  const items: SidebarItem[] = [
    { href: '/dashboard',         label: 'Início',     icon: <span aria-hidden>🏠</span>, activePrefix: '/dashboard' },
    { href: '/dashboard/search',  label: 'Pesquisar',  icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    // Se já tiveres outras rotas de cliente, adiciona-as aqui:
    // { href: '/dashboard/client/plans', label: 'Planos', icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/client/plans' },
    // { href: '/dashboard/client/sessions', label: 'Sessões', icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/client/sessions' },
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
