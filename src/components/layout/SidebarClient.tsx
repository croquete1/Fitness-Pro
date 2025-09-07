// src/components/layout/SidebarClient.tsx
'use client';

import React from 'react';
import type { Route } from 'next';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function SidebarClient({ userLabel }: { userLabel: string }) {
  const items: NavItem[] = [
    { href: '/dashboard/clients' as Route,    label: 'Início',       icon: <span aria-hidden>🏠</span>, activePrefix: '/dashboard/clients' },
    { href: '/dashboard/my-plan' as Route,    label: 'O meu plano',  icon: <span aria-hidden>📘</span>, activePrefix: '/dashboard/my-plan' },
    { href: '/dashboard/sessions' as Route,   label: 'Sessões',      icon: <span aria-hidden>🗓️</span>, activePrefix: '/dashboard/sessions' },
    { href: '/dashboard/messages' as Route,   label: 'Mensagens',    icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/messages' },
    { href: '/dashboard/notifications' as Route, label: 'Notificações', icon: <span aria-hidden>🔔</span>, activePrefix: '/dashboard/notifications' },
    { href: '/dashboard/profile' as Route,    label: 'Perfil',       icon: <span aria-hidden>👤</span>, activePrefix: '/dashboard/profile' },
  ];

  // usa o header “default” do SidebarBase para ter o botão de colapsar/expandir e mostrar o userLabel
  return <SidebarBase items={items} userLabel={userLabel} />;
}
