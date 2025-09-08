'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  activePrefix?: string;
  section?: string;
};

type Props = {
  items: NavItem[];
  userLabel: string;           // por ex.: "Admin" | "PT" | "Cliente"
  onNavigate?: () => void;
};

export default function SidebarBase({ items, userLabel, onNavigate }: Props) {
  const pathname = usePathname() || '/';
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  // Agrupa por secção mantendo ordem
  const grouped = React.useMemo(() => {
    const map = new Map<string | undefined, NavItem[]>();
    items.forEach((it) => {
      const k = it.section;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    });
    return [...map.entries()];
  }, [items]);

  return (
    <aside className="fp-sidebar">
      {/* Cabeçalho com LOGO + Nome + role */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          {/* usa /public/logo.svg */}
          <img src="/logo.svg" alt="" width={32} height={32} className="logo" />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: .2 }}>Fitness Pro</div>
            <div className="small text-muted" style={{
              maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {userLabel}
            </div>
          </div>
        </div>
        <div className="fp-sb-actions">
          {/* compactar/expandir */}
          <button
            type="button"
            className="btn icon"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            onClick={toggleCollapsed}
          >
            {collapsed ? '➡️' : '⬅️'}
          </button>
          {/* afixar/desafixar */}
          <button
            type="button"
            className="btn icon"
            aria-label={pinned ? 'Desafixar menu' : 'Afixar menu'}
            title={pinned ? 'Desafixar menu' : 'Afixar menu'}
            onClick={togglePinned}
            style={{ transform: pinned ? 'rotate(25deg)' : 'none', transition: 'transform .2s ease' }}
          >
            📌
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        {grouped.map(([section, list]) => (
          <div key={section || 'root'} className="nav-group">
            {section && <div className="nav-section">{section}</div>}
            {list!.map((it) => {
              const hrefStr = it.href;
              const active =
                pathname === hrefStr ||
                (!!it.activePrefix && pathname.startsWith(it.activePrefix));
              return (
                <div key={hrefStr}>
                  <Link
                    href={hrefStr as Route}
                    className="nav-item"
                    data-active={active ? 'true' : 'false'}
                    onClick={onNavigate}
                  >
                    <span className="nav-icon" aria-hidden>{it.icon ?? '•'}</span>
                    <span className="nav-label">{it.label}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
