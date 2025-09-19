'use client';
import * as React from 'react';
import SidebarBase, { type NavItem } from '@/components/layout/SidebarBase';

export default function SidebarPT({ userLabel }: { userLabel?: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/pt',          label: 'Painel',       icon: <span aria-hidden>📊</span>, exact: true, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/sessions', label: 'Sessões',      icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/pt/sessions' },
    { href: '/dashboard/pt/my-plan',  label: 'Planos',       icon: <span aria-hidden>🗂️</span>, activePrefix: '/dashboard/pt/my-plan' },
    { href: '/dashboard/pt/messages', label: 'Mensagens',    icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/pt/messages' },
    { href: '/dashboard/notifications', label: 'Notificações', icon: <span aria-hidden>🔔</span>, activePrefix: '/dashboard/notifications' },
    { href: '/dashboard/history',     label: 'Histórico',    icon: <span aria-hidden>📜</span>, activePrefix: '/dashboard/history' },
    { href: '/dashboard/profile',     label: 'Perfil',       icon: <span aria-hidden>👤</span>, activePrefix: '/dashboard/profile' },
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
