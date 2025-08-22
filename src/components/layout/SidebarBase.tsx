'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/layout/SidebarProvider';

export type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};
export type Group = { title: string; items: Item[] };

function isActive(pathname: string, href: string, exact?: boolean) {
  const clean =
    pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (exact || href === '/dashboard') return clean === href;
  return clean === href || clean.startsWith(href + '/');
}

type SidebarBaseProps = {
  nav: Group[];
  showToggle?: boolean;
};

export default function SidebarBase({ nav, showToggle = true }: SidebarBaseProps) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  return (
    <div className="fp-sb-flyout">
      {/* Cabeçalho */}
      <div className="fp-sb-head">
        <a className="fp-sb-brand" href="/dashboard" aria-label="Início">
          <Image
            src="/logo.png"
            width={28}
            height={28}
            alt="Logo"
            className="logo"
            priority
          />
          <span className="brand-text">
            <span className="brand-name">Fitness Pro</span>
            <span className="brand-sub">Admin &amp; PT</span>
          </span>
        </a>

        {showToggle && (
          <div className="fp-sb-actions">
            {/* Afixar/desafixar */}
            <button
              type="button"
              className="btn icon"
              aria-label={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
              title={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
              onClick={togglePinned}
            >
              {pinned ? '📌' : '📍'}
            </button>

            {/* Colapsar/Expandir */}
            <button
              type="button"
              className="btn icon"
              aria-label={collapsed ? 'Expandir menu' : 'Encolher para ícones'}
              title={collapsed ? 'Expandir menu' : 'Encolher para ícones'}
              onClick={toggleCollapsed}
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        {nav.map((group) => (
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
    </div>
  );
}
