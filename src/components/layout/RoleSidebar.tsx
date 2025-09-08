// src/components/layout/RoleSidebar.tsx
'use client';

import React from 'react';
import type { Route } from 'next';
import SidebarBase, { type NavItem } from './SidebarBase';
import type { AppRole } from '@/lib/roles';

export default function RoleSidebar({
  role,
  userLabel,
}: {
  role: AppRole;
  userLabel: string;
}) {
  let items: NavItem[] = [];

  if (role === 'ADMIN') {
    items = [
      { href: '/dashboard/admin' as Route,            label: 'Painel',       icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/admin' },
      { href: '/dashboard/admin/users' as Route,      label: 'Utilizadores', icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/admin/users' },
      { href: '/dashboard/admin/plans' as Route,      label: 'Planos',       icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/admin/plans' },
      { href: '/dashboard/search' as Route,           label: 'Pesquisar',    icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
      // Definições comum (rota existente)
      { href: '/dashboard/settings' as Route,         label: 'Definições',   icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
    ];
  } else if (role === 'PT') {
    items = [
      { href: '/dashboard/pt' as Route,                       label: 'Painel',      icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/pt' },
      { href: '/dashboard/pt/clients' as Route,               label: 'Clientes',    icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/pt/clients' },
      { href: '/dashboard/pt/plans' as Route,                 label: 'Planos',      icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/pt/plans' },
      { href: '/dashboard/pt/sessions/calendar' as Route,     label: 'Calendário',  icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/pt/sessions' },
      // Usa a rota existente de settings para evitar erro de typedRoutes
      { href: '/dashboard/settings' as Route,                 label: 'Definições',  icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
      { href: '/dashboard/search' as Route,                   label: 'Pesquisar',   icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    ];
  } else {
    // CLIENT
    items = [
      { href: '/dashboard/clients' as Route,   label: 'Painel',       icon: <span aria-hidden>🏠</span>, activePrefix: '/dashboard/clients' },
      { href: '/dashboard/my-plan' as Route,   label: 'O meu plano',  icon: <span aria-hidden>🗂️</span>, activePrefix: '/dashboard/my-plan' },
      { href: '/dashboard/sessions' as Route,  label: 'Sessões',      icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/sessions' },
      { href: '/dashboard/messages' as Route,  label: 'Mensagens',    icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/messages' },
      { href: '/dashboard/profile' as Route,   label: 'Perfil',       icon: <span aria-hidden>👤</span>, activePrefix: '/dashboard/profile' },
      { href: '/dashboard/settings' as Route,  label: 'Definições',   icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
    ];
  }

  return <SidebarBase items={items} userLabel={userLabel} />;
}
