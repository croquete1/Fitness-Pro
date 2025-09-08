'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;                // manter string para evitar conflitos de typedRoutes
  label: string;
  icon?: React.ReactNode;
  activePrefix?: string;       // prefixo opcional para marcar active
  section?: string;            // nome da secção (opcional)
};

type Props = {
  items: NavItem[];
  userLabel: string;
  onNavigate?: () => void;
};

export default function SidebarBase({ items, userLabel, onNavigate }: Props) {
  const pathname = usePathname();
  const { pinned, collapsed, togglePinned, toggleCollapsed } = useSidebar();

  // agrupar por secção preservando ordem
  const groups = React.useMemo(() => {
    const res = new Map<string, NavItem[]>();
    items.forEach((it) => {
      const key = it.section ?? '';
      const list = res.get(key);
      if (list) list.push(it);
      else res.set(key, [it]);
    });
    return Array.from(res.entries()); // [section, items[]]
  }, [items]);

  function isActive(it: NavItem) {
    if (it.activePrefix) return pathname.startsWith(it.activePrefix);
    return pathname === it.href;
  }

  return (
    <aside className="fp-sidebar" aria-label="Navegação principal">
      {/* Cabeçalho */}
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

        {/* Ações da sidebar (só aqui, nunca no header) */}
        <div className="fp-sb-actions">
          <button
            type="button"
            className="btn icon"
            aria-pressed={collapsed}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            onClick={toggleCollapsed}
          >
            ☰
          </button>
          <button
            type="button"
            className="btn icon"
            aria-pressed={pinned}
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
        {groups.map(([section, list]) => (
          <div key={section || 'root'} className="nav-group">
            {section && <div className="nav-section">{section}</div>}
            {list.map((it) => {
              const active = isActive(it);
              return (
                <div key={`${it.href}:${it.label}`} style={{ marginBottom: 6 }}>
                  <Link
                    href={it.href as any}
                    className="nav-item"
                    data-active={active ? 'true' : 'false'}
                    prefetch
                    onClick={onNavigate}
                  >
                    <span className="nav-icon">{it.icon ?? '•'}</span>
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
