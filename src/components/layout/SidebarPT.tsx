// src/components/layout/SidebarPT.tsx
'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarPT({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/pt',                    label: 'Resumo',      icon: <span aria-hidden>🏠</span>, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/clients',            label: 'Clientes',     icon: <span aria-hidden>👥</span>, activePrefix: '/dashboard/pt/clients' },
    { href: '/dashboard/pt/plans',              label: 'Planos',       icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/pt/plans' },
    { href: '/dashboard/pt/sessions/calendar',  label: 'Calendário',   icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/pt/sessions' },

    // Extras úteis do PT
    { href: '/dashboard/pt/settings/folgas',    label: 'Folgas',       icon: <span aria-hidden>🗓️</span>, activePrefix: '/dashboard/pt/settings/folgas' },
    { href: '/dashboard/pt/settings/locations', label: 'Localizações', icon: <span aria-hidden>📍</span>, activePrefix: '/dashboard/pt/settings/locations' },
    { href: '/dashboard/pt/wallet',             label: 'Carteira',     icon: <span aria-hidden>💳</span>, activePrefix: '/dashboard/pt/wallet' },

    // Globais
    { href: '/dashboard/search',                label: 'Pesquisar',    icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    { href: '/dashboard/settings',              label: 'Definições',   icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
  ];

  const header = (
    <div className="px-3 pt-3 pb-2">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 px-3 py-2">
        <div className="text-xs opacity-70">Olá,</div>
        <div className="text-sm font-semibold truncate">{userLabel}</div>
      </div>
    </div>
  );

  return <SidebarBase items={items} header={header} />;
}
