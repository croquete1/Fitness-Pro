'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * A sidebar respeita:
 *  - Admin: vê todos os grupos (Geral, PT, Admin, Sistema)
 *  - Trainer: vê apenas Geral (Dashboard/Relatórios se quiseres) + PT
 *  - Client: só Geral (Dashboard) por enquanto
 *
 * Mantém a tua lógica de "pin" e "collapse" via html[data-sb-collapsed]
 * (não mexi no wrapper nem no CSS para não quebrar nada).
 */

type NavItem = { href: string; label: string; icon: string; startsWith?: boolean };
type NavGroup = { title: string; items: NavItem[] };

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="nav-item"
      data-active={active ? 'true' : 'false'}
      aria-current={active ? 'page' : undefined}
    >
      <span className="nav-icon nav-emoji" aria-hidden>{item.icon}</span>
      <span className="nav-label">{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || '/';
  const { data } = useSession();
  const role = String((data as any)?.user?.role ?? (data as any)?.role ?? 'CLIENT').toUpperCase();

  // groups “base”
  const groupGeral: NavGroup = {
    title: 'GERAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊', startsWith: true },
      { href: '/dashboard/reports', label: 'Relatórios', icon: '🧾' },
      { href: '/dashboard/settings', label: 'Definições', icon: '⚙️' },
    ],
  };

  const groupPT: NavGroup = {
    title: 'PT',
    items: [
      { href: '/dashboard/pt/clients', label: 'Clientes', icon: '🧑‍🤝‍🧑', startsWith: true },
      { href: '/dashboard/pt/plans', label: 'Planos', icon: '🧱' },
      { href: '/dashboard/pt/library', label: 'Biblioteca', icon: '🧠', startsWith: true },
    ],
  };

  const groupAdmin: NavGroup = {
    title: 'ADMIN',
    items: [
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: '✅', startsWith: true },
      { href: '/dashboard/admin/users', label: 'Utilizadores', icon: '👥', startsWith: true },
    ],
  };

  const groupSystem: NavGroup = {
    title: 'SISTEMA',
    items: [{ href: '/dashboard/system/health', label: 'Saúde do sistema', icon: '🧰' }],
  };

  // filtra por role
  let groups: NavGroup[] = [];
  if (role === 'ADMIN') {
    groups = [groupGeral, groupPT, groupAdmin, groupSystem];
  } else if (role === 'TRAINER') {
    // trainer: sem secção Admin e Sistema; podes esconder “Relatórios/Definições” se quiser
    groups = [
      { title: groupGeral.title, items: [groupGeral.items[0]] }, // só Dashboard
      groupPT,
    ];
  } else {
    // client: só dashboard por agora
    groups = [{ title: groupGeral.title, items: [groupGeral.items[0]] }];
  }

  // highlight ativo (corrige o “ficar sempre Dashboard”)
  const isActive = (it: NavItem) => {
    if (it.startsWith) return pathname.startsWith(it.href);
    return pathname === it.href;
  };

  // nada de toggles no header (já está no CSS), mantemos só os botões da brand (se existirem)
  return (
    <div className="fp-nav">
      {groups.map((g) => (
        <div key={g.title} className="nav-group">
          <div className="nav-section">{g.title}</div>
          {g.items.map((it) => (
            <NavLink key={it.href} item={it} active={isActive(it)} />
          ))}
        </div>
      ))}
    </div>
  );
}
