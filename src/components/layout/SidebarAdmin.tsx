// src/components/layout/SidebarAdmin.tsx
'use client';

import * as React from 'react';
import SidebarBase, { type NavItem } from '@/components/layout/SidebarBase';

export default function SidebarAdmin({ userLabel }: { userLabel?: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/admin',               label: 'Painel',                 icon: <span aria-hidden>📊</span>, exact: true, activePrefix: '/dashboard/admin' },
    { href: '/dashboard/admin/approvals',     label: 'Aprovações',             icon: <span aria-hidden>✅</span>, activePrefix: '/dashboard/admin/approvals' },
    { href: '/dashboard/admin/users',         label: 'Utilizadores',           icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/admin/users' },
    { href: '/dashboard/admin/exercises',     label: 'Exercícios',             icon: <span aria-hidden>🏋️</span>, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans',         label: 'Planos',                 icon: <span aria-hidden>🗂️</span>, activePrefix: '/dashboard/admin/plans' },
    { href: '/dashboard/admin/pts-schedule',  label: 'Agenda PTs',             icon: <span aria-hidden>🗓️</span>, activePrefix: '/dashboard/admin/pts-schedule' },
    { href: '/dashboard/admin/notifications', label: 'Centro de notificações', icon: <span aria-hidden>🔔</span>, activePrefix: '/dashboard/admin/notifications' },
    { href: '/dashboard/admin/history',       label: 'Histórico',              icon: <span aria-hidden>📜</span>, activePrefix: '/dashboard/admin/history' },
    { href: '/dashboard/sistema',             label: 'Sistema',                 icon: <span aria-hidden>🛠️</span>, activePrefix: '/dashboard/sistema' },
  ];

  const header = (
    <div className="flex items-center gap-3">
      <img src="/logo.png" alt="Fitness Pro" width={24} height={24} className="rounded" />
      <div className="leading-tight">
        <div className="text-sm font-semibold">Fitness Pro</div>
        {userLabel && <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userLabel}</div>}
      </div>
    </div>
  );

  return <SidebarBase items={items} header={header} />;
}
