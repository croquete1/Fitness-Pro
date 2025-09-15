// src/components/layout/SidebarAdmin.tsx
'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarAdmin({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/admin',                  label: 'Painel',        icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/admin' },
    { href: '/dashboard/admin/approvals',        label: 'Aprovações',    icon: <span aria-hidden>✅</span>, activePrefix: '/dashboard/admin/approvals' },
    { href: '/dashboard/admin/users',            label: 'Utilizadores',  icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/admin/users' },
    { href: '/dashboard/admin/exercises',        label: 'Exercícios',    icon: <span aria-hidden>🏋️</span>, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans',            label: 'Planos',        icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/admin/plans' },

    // Notificações (admin)
    { href: '/dashboard/notifications',          label: 'Notificações',  icon: <span aria-hidden>🔔</span>, activePrefix: '/dashboard/notifications' },

    // Logs (admin)
    { href: '/dashboard/admin/logs',             label: 'Logs',          icon: <span aria-hidden>🧾</span>, activePrefix: '/dashboard/admin/logs' },
    { href: '/dashboard/admin/logs/plans',       label: 'Logs de Planos',icon: <span aria-hidden>📚</span>, activePrefix: '/dashboard/admin/logs/plans' },
    { href: '/dashboard/admin/logs/accounts',    label: 'Logs de Contas',icon: <span aria-hidden>👤</span>, activePrefix: '/dashboard/admin/logs/accounts' },

    // Métricas / sistema
    { href: '/dashboard/system/metrics',         label: 'Métricas',      icon: <span aria-hidden>📈</span>, activePrefix: '/dashboard/system/metrics' },

    // Pesquisa e definições
    { href: '/dashboard/search',                 label: 'Pesquisar',     icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    { href: '/dashboard/settings',               label: 'Definições',    icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
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
