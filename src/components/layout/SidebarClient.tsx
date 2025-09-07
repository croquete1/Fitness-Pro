'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';
import useUnreadNotifications from '@/hooks/useUnreadNotifications';

export default function SidebarClient({ userLabel }: { userLabel: string }) {
  const unread = useUnreadNotifications();

  const items: NavItem[] = [
    { href: '/dashboard',          label: 'Painel',       icon: <span aria-hidden>🏠</span>, activePrefix: '/dashboard' },
    { href: '/dashboard/my-plan',  label: 'O meu plano',  icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/my-plan' },
    { href: '/dashboard/sessions', label: 'Sessões',      icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/sessions' },
    { href: '/dashboard/messages', label: 'Mensagens',    icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/messages' },
    { href: '/dashboard/notifications', label: 'Notificações', icon: <span aria-hidden>🔔</span>, activePrefix: '/dashboard/notifications' },
    { href: '/dashboard/profile',  label: 'Perfil',       icon: <span aria-hidden>👤</span>, activePrefix: '/dashboard/profile' },
  ];

  const footer = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <a className="btn chip" href="/dashboard/my-plan">Abrir plano</a>
      <a className="btn chip" href="/dashboard/messages">Mensagens</a>
      <a className="btn chip" href="/dashboard/profile">Editar perfil</a>
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
