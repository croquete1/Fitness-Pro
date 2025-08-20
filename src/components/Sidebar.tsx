'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type AppRole = 'ADMIN' | 'TRAINER' | 'CLIENT' | string;

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

export default function Sidebar({ role = 'CLIENT' }: { role?: AppRole }) {
  const pathname = usePathname() || '/';
  const R = String(role).toUpperCase();

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

  let groups: NavGroup[] = [];
  if (R === 'ADMIN') {
    groups = [groupGeral, groupPT, groupAdmin, groupSystem];
  } else if (R === 'TRAINER') {
    groups = [{ title: groupGeral.title, items: [groupGeral.items[0]] }, groupPT];
  } else {
    groups = [{ title: groupGeral.title, items: [groupGeral.items[0]] }];
  }

  const isActive = (it: NavItem) => (it.startsWith ? pathname.startsWith(it.href) : pathname === it.href);

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
