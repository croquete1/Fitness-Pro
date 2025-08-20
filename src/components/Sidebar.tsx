// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarWrapper';
import { Pin, PinOff, ChevronsLeft, ChevronsRight } from 'lucide-react';

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};
type Group = { title: string; items: Item[] };

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
  // normaliza trailing slash (excepto '/')
  const clean = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (exact || href === '/dashboard') {
    // Dashboard só activo em match exacto
    return clean === href;
  }
  return clean === href || clean.startsWith(href + '/');
}

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  return (
    <>
      {/* Cabeçalho da sidebar */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          {/* Logo (usa o teu /logo.svg ou imagem que já tenhas) */}
          <img src="/logo.png" alt="Logo" className="logo" />
          <strong>Fitness Pro</strong>
        </div>

        <div className="fp-sb-actions">
          {/* PIN – afixar/desafixar, não colapsa */}
          <button
            type="button"
            className="btn icon"
            aria-label={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
            title={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
            onClick={togglePinned}
            data-role="sb-pin"
          >
            {pinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>

          {/* COLAPSO – mostrar só ícones vs. expandida; não mexe no pin */}
          <button
            type="button"
            className="btn icon"
            aria-label={collapsed ? 'Expandir menu' : 'Encolher para ícones'}
            title={collapsed ? 'Expandir menu' : 'Encolher para ícones'}
            onClick={toggleCollapsed}
            data-role="sb-toggle"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Navegação */}
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
    </>
  );
}
