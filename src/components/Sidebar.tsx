'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarProps = { role?: string };

const NAV = {
  ADMIN: [
    { section: 'GERAL' },
    { title: 'Dashboard',   href: '/dashboard',            icon: '📊' },
    { title: 'Relatórios',  href: '/dashboard/reports',    icon: '🧾' },
    { title: 'Definições',  href: '/dashboard/settings',   icon: '⚙️' },

    { section: 'PT' },
    { title: 'Clientes',    href: '/dashboard/pt/clients', icon: '👫' },
    { title: 'Planos',      href: '/dashboard/pt/plans',   icon: '🧱' },
    { title: 'Biblioteca',  href: '/dashboard/pt/library', icon: '📚' },

    { section: 'ADMIN' },
    { title: 'Aprovações',  href: '/dashboard/admin/approvals', icon: '✅' },
    { title: 'Utilizadores',href: '/dashboard/admin/users',     icon: '👥' },

    { section: 'SISTEMA' },
    { title: 'Saúde do sistema', href: '/dashboard/system/health', icon: '🧰' },
  ],
  TRAINER: [
    { section: 'GERAL' },
    { title: 'Dashboard',   href: '/dashboard',            icon: '📊' },

    { section: 'PT' },
    { title: 'Clientes',    href: '/dashboard/pt/clients', icon: '👫' },
    { title: 'Planos',      href: '/dashboard/pt/plans',   icon: '🧱' },
    { title: 'Biblioteca',  href: '/dashboard/pt/library', icon: '📚' },
  ],
  CLIENT: [
    { section: 'GERAL' },
    { title: 'Dashboard',   href: '/dashboard',            icon: '📊' },
  ],
} as const;

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

export default function Sidebar({ role = 'CLIENT' }: SidebarProps) {
  const pathname = usePathname();
  const items = (NAV as any)[role] ?? NAV.CLIENT;

  return (
    <nav className="fp-nav">
      {items.map((it: any, i: number) => {
        if (it.section) {
          return <div key={`sec-${i}`} className="nav-section">{it.section}</div>;
        }
        const active = isActive(pathname, it.href);
        return (
          <Link key={it.href} href={it.href} className="nav-item" data-active={active ? 'true' : 'false'}>
            <span className="nav-icon nav-emoji" aria-hidden>{it.icon}</span>
            <span className="nav-label">{it.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
