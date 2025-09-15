// src/components/layout/SidebarClient.tsx
'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarClient({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard',           label: 'Resumo',      icon: <span aria-hidden>🏠</span>, activePrefix: '/dashboard' },
    { href: '/dashboard/my-plan',   label: 'Meu plano',   icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/my-plan' },
    { href: '/dashboard/messages',  label: 'Mensagens',   icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/messages' },
    { href: '/dashboard/history',   label: 'Histórico',   icon: <span aria-hidden>📜</span>, activePrefix: '/dashboard/history' },

    // Globais
    { href: '/dashboard/search',    label: 'Pesquisar',   icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    { href: '/dashboard/profile',   label: 'Perfil',      icon: <span aria-hidden>👤</span>, activePrefix: '/dashboard/profile' },
    { href: '/dashboard/settings',  label: 'Definições',  icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
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
