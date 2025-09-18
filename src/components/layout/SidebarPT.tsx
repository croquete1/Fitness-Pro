// src/components/layout/SidebarPT.tsx
'use client';

import * as React from 'react';
import SidebarBase, { type NavItem } from '@/components/layout/SidebarBase';

export default function SidebarPT({ userLabel }: { userLabel?: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/pt',           label: 'Painel',     icon: <span aria-hidden>📊</span>, exact: true, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/agenda',    label: 'Agenda',     icon: <span aria-hidden>🗓️</span>, activePrefix: '/dashboard/pt/agenda' },
    { href: '/dashboard/pt/clientes',  label: 'Clientes',   icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/pt/clientes' },
    { href: '/dashboard/pt/planos',    label: 'Planos',     icon: <span aria-hidden>🗂️</span>, activePrefix: '/dashboard/pt/planos' },
    { href: '/dashboard/pt/exercicios',label: 'Exercícios', icon: <span aria-hidden>🏋️</span>, activePrefix: '/dashboard/pt/exercicios' },
    { href: '/dashboard/pt/mensagens', label: 'Mensagens',  icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/pt/mensagens' },
    { href: '/dashboard/pt/historico', label: 'Histórico',  icon: <span aria-hidden>📜</span>, activePrefix: '/dashboard/pt/historico' },
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
