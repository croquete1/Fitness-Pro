'use client';

import React from 'react';
import type { AppRole } from '@/lib/roles';
import SidebarBase, { type NavItem } from './SidebarBase';

export default function RoleSidebar({ role, userLabel }: { role: AppRole; userLabel: string }) {
  const items: NavItem[] =
    role === 'ADMIN'
      ? [
          { href: '/dashboard/admin', label: 'Início', icon: '🏠' },
          { href: '/dashboard/admin/users', label: 'Utilizadores', icon: '👥' },
          { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: '✅' },
          { href: '/dashboard/admin/plans', label: 'Planos', icon: '📝' },
          { href: '/dashboard/admin/logs', label: 'Logs', icon: '📜' },
        ]
      : role === 'PT'
      ? [
          { href: '/dashboard/pt', label: 'Início', icon: '🏠' },
          { href: '/dashboard/pt/clients', label: 'Clientes', icon: '🧑‍🤝‍🧑' },
          { href: '/dashboard/pt/training-plans', label: 'Planos', icon: '📝' },
          { href: '/dashboard/pt/sessions/calendar', label: 'Agenda', icon: '📅' },
          { href: '/dashboard/pt/settings', label: 'Definições', icon: '⚙️' },
        ]
      : [
          { href: '/dashboard/clients', label: 'Início', icon: '🏠' },
          { href: '/dashboard/my-plan', label: 'O meu plano', icon: '🏋️' },
          { href: '/dashboard/sessions', label: 'Sessões', icon: '📅' },
          { href: '/dashboard/messages', label: 'Mensagens', icon: '✉️' },
          { href: '/dashboard/profile', label: 'Conta', icon: '👤' },
        ];

  return (
    <SidebarBase
      items={items}
      header={
        <div className="p-4">
          <div className="text-xs opacity-70">Sessão</div>
          <div className="text-sm font-semibold">{userLabel}</div>
        </div>
      }
    />
  );
}
