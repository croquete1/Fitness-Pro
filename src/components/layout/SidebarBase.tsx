'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;                 // string para evitar chatices com typedRoutes
  label: string;
  icon?: React.ReactNode;
  activePrefix?: string;        // ex.: "/dashboard/admin/users"
  section?: string;             // opcional: separadores
};

export default function SidebarBase({
  items,
  userLabel,
}: {
  items: NavItem[];
  userLabel: string;
}) {
  const pathname = usePathname();
  const { pinned, collapsed, togglePinned, toggleCollapsed } = useSidebar();

  // agrupar por section mantendo ordem
  const groups = React.useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const it of items) {
      const k = it.section ?? '';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <aside className="fp-sidebar" role="navigation" aria-label="Menu lateral">
      {/* Cabeçalho (logo + user + ações) */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <button className="logo" aria-label="Fitness Pro">💪</button>
          <div>
            <div className="brand-name" style={{ fontWeight: 800 }}>Fitness Pro</div>
            <div
              className="small text-muted"
              title={userLabel}
              style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {userLabel}
            </div>
          </div>
        </div>

        <div className="fp-sb-actions">
          {/* ☰ = compactar/expandir (CORRETO) */}
          <button
            type="button"
            className="btn icon btn-toggle"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            onClick={toggleCollapsed}
          >
            ☰
          </button>
          {/* 📌 = afixar/desafixar (CORRETO) */}
          <button
            type="button"
            className="btn icon btn-pin"
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
        {groups.map(([section, links]) => (
          <div key={section || 'root'} className="nav-group">
            {section && <div className="nav-section">{section}</div>}
            {links.map((it) => {
              const active = it.activePrefix
                ? pathname?.startsWith(it.activePrefix)
                : pathname === it.href;
              return (
                <div key={it.href} style={{ marginBottom: 6 }}>
                  <Link
                    href={it.href as any}
                    className="nav-item"
                    data-active={active ? 'true' : 'false'}
                    prefetch
                  >
                    <span className="nav-icon">{it.icon ?? <span className="nav-emoji">•</span>}</span>
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
