'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';
import useUnreadNotifications from '@/hooks/useUnreadNotifications';

export default function SidebarPT({ userLabel }: { userLabel: string }) {
  const unread = useUnreadNotifications();

  const items: NavItem[] = [
    { href: '/dashboard/pt',                   label: 'Painel',       icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/pt' },
    { href: '/dashboard/pt/clients',           label: 'Clientes',     icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/pt/clients' },
    { href: '/dashboard/pt/plans',             label: 'Planos',       icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/pt/plans' },
    { href: '/dashboard/pt/sessions/calendar', label: 'Calendário',   icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/pt/sessions' },
    { href: '/dashboard/notifications',        label: 'Notificações', icon: <span aria-hidden>🔔</span>, activePrefix: '/dashboard/notifications' },
    { href: '/dashboard/pt/settings',          label: 'Definições',   icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/pt/settings' },
  ];

  const footer = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <a className="btn chip" href="/dashboard/pt/clients">Novo cliente</a>
      <a className="btn chip" href="/dashboard/pt/plans">Novo plano</a>
      <a className="btn chip" href="/dashboard/pt/sessions/new">Agendar sessão</a>
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
