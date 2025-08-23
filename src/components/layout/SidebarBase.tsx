'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pin, PinOff, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useSidebar } from './SidebarProvider';

export type NavItem = { label: string; href: string; icon?: React.ReactNode };
export type NavGroup = { title?: string; items: NavItem[] };

type Props = { brand?: React.ReactNode; groups: NavGroup[] };

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <aside className="fp-sb-flyout" aria-label="Sidebar">
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Início">
          {brand}
        </Link>

        <div className="fp-sb-actions">
          <button
            className="btn icon"
            type="button"
            onClick={togglePinned}
            title={pinned ? 'Desafixar (auto-ocultar)' : 'Afixar'}
            aria-pressed={pinned}
          >
            {pinned ? <Pin size={16} /> : <PinOff size={16} />}
          </button>

          <button
            className="btn icon"
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir' : 'Compactar'}
            aria-pressed={collapsed}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </div>

      <nav className="fp-nav">
        {groups.map((g, idx) => (
          <div key={idx} className="nav-group">
            {g.title ? <div className="nav-section">{g.title}</div> : null}

            {g.items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="nav-item"
                data-active={isActive(it.href) ? 'true' : 'false'}
              >
                {it.icon ? <span className="nav-icon">{it.icon}</span> : null}
                <span className="nav-label">{it.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
