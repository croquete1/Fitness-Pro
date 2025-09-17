'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import React from 'react';
import {useSidebar} from './SidebarCtx';
import type { AppRole } from '@/lib/roles';

export type NavItem = { href: string; label: string; icon: string };

export function getRoleNav(role: AppRole): NavItem[] {
  if (role === 'ADMIN') {
    return [
      { href: '/dashboard/admin',            label: 'Início',        icon: '🏠' },
      { href: '/dashboard/admin/users',      label: 'Utilizadores',  icon: '👥' },
      { href: '/dashboard/admin/approvals',  label: 'Aprovações',    icon: '✅' },
      { href: '/dashboard/admin/exercises',  label: 'Exercícios',    icon: '📚' },
      { href: '/dashboard/admin/plans',      label: 'Planos',        icon: '📝' },
      { href: '/dashboard/admin/pt-schedule',label: 'Agenda PTs',    icon: '📅' },
      { href: '/dashboard/admin/profile',    label: 'O meu perfil',  icon: '⚙️' },
    ];
  }
  if (role === 'PT') {
    return [
      { href: '/dashboard/pt',           label: 'Início',     icon: '🏠' },
      { href: '/dashboard/pt/clients',   label: 'Clientes',   icon: '🧑‍🤝‍🧑' },
      { href: '/dashboard/pt/plans',     label: 'Planos',     icon: '📝' },
      { href: '/dashboard/pt/exercises', label: 'Exercícios', icon: '📚' },
      { href: '/dashboard/pt/profile',   label: 'O meu perfil', icon: '⚙️' },
    ];
  }
  return [
    { href: '/dashboard/clients',      label: 'Início',        icon: '🏠' },
    { href: '/dashboard/my-plan',      label: 'Os meus planos',icon: '📝' },
    { href: '/dashboard/notifications',label: 'Notificações',  icon: '🔔' },
    { href: '/dashboard/profile',      label: 'Conta',         icon: '👤' },
  ];
}

export default function RoleSidebar({ role, userLabel }: { role: AppRole; userLabel: string }) {
  const { toggleCollapse } = useSidebar();
  const pathname = usePathname();
  const items = getRoleNav(role);

  // “Longest prefix match” – garante apenas 1 item ativo (o mais específico)
  const activeHref = items
    .filter(i => pathname === i.href || pathname?.startsWith(i.href + '/'))
    .sort((a,b) => b.href.length - a.href.length)[0]?.href;

  const Chevron = () => (
    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M14.71 17.29L10.41 13l4.3-4.29L13 7l-6 6l6 6z"/></svg>
  );

  return (
    <aside className="fp-sidebar">
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <img src="/assets/logo.png" alt="Fitness Pro" className="logo" />
          <div>
            <div className="brand-name">Fitness Pro</div>
            <div className="brand-role">{userLabel}</div>
          </div>
        </div>
        <div className="fp-sb-actions">
          <button className="btn icon" title="Expandir/compactar" onClick={toggleCollapse}>
            <Chevron/>
          </button>
        </div>
      </div>

      <nav className="fp-nav">
        <div className="nav-group">
          {items.map(it => (
            <Link
              key={it.href}
              href={it.href}
              className="nav-item"
              data-active={activeHref === it.href}
            >
              <span className="nav-icon nav-emoji">{it.icon}</span>
              <span className="nav-label">{it.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
