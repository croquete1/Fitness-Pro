'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarClient({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/clients',  label: 'Painel',       icon: <span aria-hidden>🏠</span>, activePrefix: '/dashboard/clients' },
    { href: '/dashboard/my-plan',  label: 'O meu plano',  icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/my-plan' },
    { href: '/dashboard/sessions', label: 'Sessões',      icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/sessions' },
    { href: '/dashboard/messages', label: 'Mensagens',    icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/messages' },
    { href: '/dashboard/profile',  label: 'Perfil',       icon: <span aria-hidden>👤</span>, activePrefix: '/dashboard/profile' },
    { href: '/dashboard/settings', label: 'Definições',   icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
  ];
  return <SidebarBase items={items} userLabel={userLabel} />;
}
