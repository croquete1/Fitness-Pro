// src/components/layout/SidebarBase.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';
import { Pin, PinOff, ChevronsLeft, ChevronsRight } from 'lucide-react';

export type NavItem = { label: string; href: string; icon?: React.ReactNode };
export type NavGroup = { title?: string; items: NavItem[] };

type Props = {
  brand?: React.ReactNode;
  groups: NavGroup[];
};

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  return (
    <aside className="fp-sb-flyout" aria-label="Sidebar">
// dentro do return do SidebarBase
<div className="fp-sb-head">
  <a href="/dashboard" className="fp-sb-brand" aria-label="Início">
    {brand}
  </a>
  <div className="fp-sb-actions">
    <button className="btn icon" onClick={togglePinned} aria-pressed={pinned} title={pinned ? "Desafixar" : "Afixar"}>
      {pinned ? "📌" : "📍"}
    </button>
    <button className="btn icon" onClick={toggleCollapsed} aria-pressed={collapsed} title={collapsed ? "Expandir" : "Compactar"}>
      {collapsed ? "➡️" : "⬅️"}
    </button>
  </div>
</div>


      <nav className="fp-nav">
        {groups.map((g, idx) => (
          <div key={idx} className="nav-group">
            {g.title ? <div className="nav-section">{g.title}</div> : null}
            {g.items.map((it) => {
              const active =
                pathname === it.href ||
                (it.href !== '/' && pathname.startsWith(it.href));
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
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
