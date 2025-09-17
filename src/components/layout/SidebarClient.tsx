'use client';

import * as React from 'react';
import SidebarBase, { type NavItem } from '@/components/layout/SidebarBase';

export default function SidebarClient({ userLabel }: { userLabel?: string }) {
  const items: NavItem[] = [
    { href: '/dashboard',            label: 'Painel',     icon: <span aria-hidden>📊</span>, exact: true, activePrefix: '/dashboard' },
    { href: '/dashboard/planos',     label: 'Planos',     icon: <span aria-hidden>🗂️</span>, activePrefix: '/dashboard/planos' },
    { href: '/dashboard/nutricao',   label: 'Nutrição',   icon: <span aria-hidden>🥗</span>, activePrefix: '/dashboard/nutricao' },
    { href: '/dashboard/sessoes',    label: 'Sessões',    icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/sessoes' },
    { href: '/dashboard/calendario', label: 'Calendário', icon: <span aria-hidden>🗓️</span>, activePrefix: '/dashboard/calendario' },
    { href: '/dashboard/mensagens',  label: 'Mensagens',  icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/mensagens' },
    { href: '/dashboard/historico',  label: 'Histórico',  icon: <span aria-hidden>📜</span>, activePrefix: '/dashboard/historico' },
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
