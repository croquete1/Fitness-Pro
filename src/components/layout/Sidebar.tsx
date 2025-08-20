// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode; // mantemos os teus ícones/emoji
  exact?: boolean;       // quando true, só active em match exacto
};

type Group = {
  title: string;
  items: Item[];
};

const NAV: Group[] = [
  {
    title: 'GERAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <span className="nav-emoji">📊</span>, exact: true },
      { href: '/dashboard/reports', label: 'Relatórios', icon: <span className="nav-emoji">🧾</span> },
      { href: '/dashboard/settings', label: 'Definições', icon: <span className="nav-emoji">⚙️</span> },
    ],
  },
  {
    title: 'PT',
    items: [
      { href: '/dashboard/pt/clients', label: 'Clientes', icon: <span className="nav-emoji">👫</span> },
      { href: '/dashboard/pt/plans', label: 'Planos', icon: <span className="nav-emoji">🧱</span> },
      { href: '/dashboard/pt/library', label: 'Biblioteca', icon: <span className="nav-emoji">📚</span> },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <span className="nav-emoji">✅</span> },
      { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <span className="nav-emoji">👥</span> },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { href: '/dashboard/system/health', label: 'Saúde do sistema', icon: <span className="nav-emoji">🧰</span> },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  // normaliza (remove trailing slash do pathname, excepto raiz)
  const clean = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (exact) return clean === href;
  return clean === href || clean.startsWith(href + '/');
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="fp-nav">
      {NAV.map((group) => (
        <div key={group.title} className="nav-group">
          <div className="nav-section">{group.title}</div>

          {group.items.map((item) => {
            const active = isActive(pathname, item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item"
                data-active={active ? 'true' : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
