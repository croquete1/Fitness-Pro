'use client';

import React from 'react';
import SidebarBase, { type NavItem } from './SidebarBase';
import type { AppRole } from '@/lib/roles';

function adminItems(): NavItem[] {
  return [
    { href: '/dashboard/admin',           label: 'Painel',       icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/admin' },
    { href: '/dashboard/admin/approvals', label: 'Aprovações',   icon: <span aria-hidden>✅</span>, activePrefix: '/dashboard/admin/approvals' },
    { href: '/dashboard/admin/users',     label: 'Utilizadores', icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/admin/users' },
    { href: '/dashboard/admin/exercises', label: 'Exercícios',   icon: <span aria-hidden>🏋️</span>, activePrefix: '/dashboard/admin/exercises' },
    { href: '/dashboard/admin/plans',     label: 'Planos',       icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/admin/plans' },
    { href: '/dashboard/search',          label: 'Pesquisar',    icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    { href: '/dashboard/settings',        label: 'Definições',   icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
  ];
}

function ptItems(): NavItem[] {
  return [
    { href: '/dashboard/pt',                    label: 'Painel',      icon: <span aria-hidden>📊</span>, activePrefix: '/dashboard/pt$' },
    { href: '/dashboard/pt/clients',           label: 'Clientes',    icon: <span aria-hidden>🧑‍🤝‍🧑</span>, activePrefix: '/dashboard/pt/clients' },
    { href: '/dashboard/pt/plans',             label: 'Planos',      icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/pt/plans' },
    { href: '/dashboard/pt/sessions/calendar', label: 'Calendário',  icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/pt/sessions' },
    { href: '/dashboard/search',               label: 'Pesquisar',   icon: <span aria-hidden>🔎</span>, activePrefix: '/dashboard/search' },
    { href: '/dashboard/pt/settings',          label: 'Definições',  icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/pt/settings' },
  ];
}

function clientItems(): NavItem[] {
  return [
    { href: '/dashboard/clients',  label: 'Painel',     icon: <span aria-hidden>🏠</span>, activePrefix: '/dashboard/clients' },
    { href: '/dashboard/my-plan',  label: 'O meu plano',icon: <span aria-hidden>📝</span>, activePrefix: '/dashboard/my-plan' },
    { href: '/dashboard/sessions', label: 'Sessões',    icon: <span aria-hidden>📅</span>, activePrefix: '/dashboard/sessions' },
    { href: '/dashboard/messages', label: 'Mensagens',  icon: <span aria-hidden>💬</span>, activePrefix: '/dashboard/messages' },
    { href: '/dashboard/profile',  label: 'Perfil',     icon: <span aria-hidden>👤</span>, activePrefix: '/dashboard/profile' },
    { href: '/dashboard/settings', label: 'Definições', icon: <span aria-hidden>⚙️</span>, activePrefix: '/dashboard/settings' },
  ];
}

export default function RoleSidebar({
  role,
  userLabel,
}: {
  role: AppRole; // 'ADMIN' | 'PT' | 'CLIENT'
  userLabel: string;
}) {
  const items = role === 'ADMIN' ? adminItems() : role === 'PT' ? ptItems() : clientItems();
  return <SidebarBase items={items} userLabel={userLabel} />;
}
