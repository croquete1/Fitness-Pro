// src/components/layout/SidebarBase.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

export type NavItem = { label: string; href: string; icon?: React.ReactNode };
export type NavGroup = { title?: string; items: NavItem[] };

type Props = {
  brand?: React.ReactNode;
  groups: NavGroup[];
};

// Ícones simples em SVG, dimensionados e consistentes
const Icon = {
  Pin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 3l7 7-3 3 2 2-2 2-2-2-3 3-7-7 3-3-2-2 2-2 2 2 3-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Unpin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3l18 18M14 3l7 7-3 3 2 2-2 2-2-2-3 3-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Collapse: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 5v14M11 7l-4 5 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="12" y="4" width="8" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Expand: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 5v14M13 7l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="6" y="4" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
};

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  // um link está ativo se for exatamente o href OU estiver numa sub-ruta de href
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href.endsWith('/') ? href : href + '/'));

  return (
    <aside className="fp-sb-flyout" aria-label="Barra lateral">
      {/* Cabeçalho da sidebar */}
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Início">
          {brand}
        </Link>

        <div className="fp-sb-actions">
          <button
            className="btn icon"
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir' : 'Compactar'}
            aria-pressed={collapsed}
            aria-label={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
          >
            {collapsed ? Icon.Expand : Icon.Collapse}
          </button>

          <button
            className="btn icon"
            type="button"
            onClick={togglePinned}
            title={pinned ? 'Desafixar (auto-ocultar)' : 'Afixar'}
            aria-pressed={pinned}
            aria-label={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
          >
            {pinned ? Icon.Unpin : Icon.Pin}
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav" role="navigation">
        {groups.map((g, idx) => (
          <div key={idx} className="nav-group">
            {g.title ? <div className="nav-section">{g.title}</div> : null}

            {g.items.map((it) => {
              const active = isActive(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                  aria-current={active ? 'page' : undefined}
                  prefetch={false}
                >
                  {it.icon ? <span className="nav-icon">{it.icon}</span> : null}
                  <span className="nav-label">{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
