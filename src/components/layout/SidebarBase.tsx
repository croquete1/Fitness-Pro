// src/components/layout/SidebarBase.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: Route;            // usa typedRoutes (strings '/dashboard/...' válidas)
  label: string;
  icon?: React.ReactNode; // emoji ou svg
  section?: string;       // opcional: agrupar por secção
  activePrefix?: string;  // ativa pelo prefixo do pathname
};

type Props = {
  items: NavItem[];
  userLabel: string;
  onNavigate?: () => void;
};

export default function SidebarBase({ items, userLabel, onNavigate }: Props) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  // Agrupa itens por secção (mantém ordem de chegada)
  const grouped = React.useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const it of items) {
      const key = it.section || '';
      const arr = map.get(key) || [];
      arr.push(it);
      map.set(key, arr);
    }
    return Array.from(map.entries()); // [section, items[]]
  }, [items]);

  return (
    <aside className="fp-sidebar" aria-label="Menu principal">
      {/* Cabeçalho da sidebar */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand" aria-label="Identidade">
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
        <div className="fp-sb-actions" role="group" aria-label="Ações do menu">
          <button
            type="button"
            className="btn icon"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            onClick={toggleCollapsed}
          >
            ☰
          </button>
          <button
            type="button"
            className={`btn icon btn-pin ${pinned ? 'is-pinned' : ''}`}
            aria-label={pinned ? 'Desafixar menu' : 'Afixar menu'}
            title={pinned ? 'Desafixar menu' : 'Afixar menu'}
            aria-pressed={pinned}
            onClick={togglePinned}
          >
            📌
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        {grouped.map(([section, arr]) => (
          <div key={section || 'root'} className="nav-group">
            {section && <div className="nav-section">{section}</div>}
            {arr.map((it) => {
              const hrefStr = it.href as string;
              const active = it.activePrefix
                ? pathname?.startsWith(it.activePrefix)
                : pathname === hrefStr;

              return (
                <div key={hrefStr} style={{ marginBottom: 6 }}>
                  <Link
                    href={it.href}
                    className="nav-item"
                    data-active={active ? 'true' : 'false'}
                    onClick={onNavigate}
                    prefetch
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="nav-icon">{it.icon || <span className="nav-emoji">📄</span>}</span>
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
