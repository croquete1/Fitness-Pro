'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';
import useUnreadNotifications from '@/hooks/useUnreadNotifications';

export default function SidebarAdmin({ userLabel }: { userLabel: string }) {
  const unread = useUnreadNotifications();

  const items: NavItem[] = [
    { href: '/dashboard/admin',           label: 'Painel',         icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/admin' },
    { href: '/dashboard/admin/approvals', label: 'Aprovações',     icon: <span aria-hidden>✅</span>, activePrefix: '/dashboard/admin/approvals' },
    { href: '/dashboard/admin/users',     label: 'Utilizadores',   icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/admin/users' },
    { href: '/dashboard/admin/exercises', label: 'Exercícios',     icon: <span aria-hidden>🏋️</span>, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans',     label: 'Planos',         icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/admin/plans' },
    { href: '/dashboard/notifications',   label: 'Notificações',   icon: <span aria-hidden>🔔</span>, activePrefix: '/dashboard/notifications' },
    { href: '/dashboard/search',          label: 'Pesquisar',      icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
  ];

  const footer = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <a className="btn chip" href="/dashboard/admin/users">Utilizadores</a>
      <a className="btn chip" href="/dashboard/admin/catalog">Catálogo</a>
      <a className="btn chip" href="/dashboard/admin/logs">Auditoria</a>
      <a className="btn chip" href="/dashboard/notifications">Centro de notificações</a>
    </div>
  );

  return (
    <SidebarBase
      items={items}
      userLabel={userLabel}
      badges={{ '/dashboard/notifications': unread }}
      footerActions={footer}
    />
  );
}
