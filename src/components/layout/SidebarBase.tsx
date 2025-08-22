'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

type Props = {
  brand?: { name: string; sub?: string; href?: string; logoSrc?: string };
  groups: NavGroup[];
};

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();
  const { collapsed, pinned, setCollapsed, toggleCollapsed, togglePinned } = useSidebar();

  const peekable = collapsed && !pinned;

  // Abre ao passar o rato quando está colapsada e não afixada
  const onEnter = () => {
    if (peekable) setCollapsed(false);
  };
  const onLeave = () => {
    if (peekable) setCollapsed(true);
  };

  return (
    <div
      className="fp-sb-flyout"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      data-collapsed={collapsed ? '1' : '0'}
      data-pinned={pinned ? '1' : '0'}
      aria-expanded={!collapsed}
      style={{
        // garante que nada tapa a sidebar
        zIndex: 2000,
        pointerEvents: 'auto',
      }}
    >
      {/* HEAD */}
      <div className="fp-sb-head">
        {brand ? (
          <Link className="fp-sb-brand" href={brand.href ?? '/dashboard'}>
            <div className="logo" style={{ width: 28, height: 28, borderRadius: 8, background: '#e5e7eb' }} />
            <span className="brand-text">
              <span className="brand-name">{brand.name}</span>
              {brand.sub ? <span className="brand-sub">{brand.sub}</span> : null}
            </span>
          </Link>
        ) : (
          <div />
        )}

        <div className="fp-sb-actions">
          {/* Colapsar/Expandir */}
          <button
            type="button"
            className="btn icon"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            onClick={toggleCollapsed}
          >
            {/* ícone “chevron” */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
            </svg>
          </button>

          {/* Afixar/Desafixar */}
          <button
            type="button"
            className="btn icon"
            aria-pressed={pinned}
            aria-label={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
            onClick={togglePinned}
          >
            {/* ícone “pin” */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {pinned ? (
                <path d="M16 3l5 5-4 1-3 7-3-3 7-3 1-4zM3 21l6-6" />
              ) : (
                <path d="M16 3l5 5-4 1-7 3 3 3-7 7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* NAV */}
      <nav className="fp-nav" aria-label="Navegação principal">
        {groups.map((g, gi) => (
          <div className="nav-group" key={`g-${gi}`}>
            {g.title ? <div className="nav-section">{g.title}</div> : null}
            {g.items.map((it) => {
              const active =
                pathname === it.href ||
                (it.href !== '/' && pathname.startsWith(it.href + '/')) ||
                (it.href !== '/' && pathname.startsWith(it.href + '?'));
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  prefetch={false}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                >
                  <span className="nav-icon" aria-hidden>{it.icon}</span>
                  <span className="nav-label">{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
