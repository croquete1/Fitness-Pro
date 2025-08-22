// src/components/layout/SidebarBase.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

// Conjunto de ícones (inline SVGs) – fiáveis e leves
export const Ico = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Reports: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h7l5 5v11H4V4Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 4v5h5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 12a7 7 0 0 0-.1-1.1l2.1-1.6-2-3.5-2.5 1A7.4 7.4 0 0 0 14 4l-.4-2.7h-3.2L10 4a7.4 7.4 0 0 0-2.5 1.8l-2.5-1-2 3.5L5 10.9A7 7 0 0 0 5 12c0 .37.03.74.1 1.1l-2.1 1.6 2 3.5 2.5-1A7.4 7.4 0 0 0 10 20l.4 2.7h3.2L14 20a7.4 7.4 0 0 0 2.5-1.8l2.5 1 2-3.5-2.1-1.6c.07-.36.1-.73.1-1.1Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="m12 2 3.1 6.3 7 .9-5 4.8 1.2 6.9-6.3-3.3-6.2 3.3 1.2-6.9-5-4.8 7-.9L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 3a4 4 0 0 1 0 8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Health: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Billing: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
};

export type NavItem = { label: string; href: string; icon: React.FC };
export type NavGroup = { title: string; items: NavItem[] };

type Props = {
  brand: React.ReactNode;
  groups: NavGroup[];
};

export default function SidebarBase({ brand, groups }: Props) {
  // usar variáveis com underscore para evitar warnings de "unused"
  const { collapsed: _collapsed, pinned: _pinned, toggleCollapsed, togglePinned } = useSidebar();
  const pathname = usePathname();

  return (
    <div className="fp-sb-flyout" style={{ pointerEvents: 'auto' }}>
      {/* HEAD */}
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand">
          {brand}
        </Link>

        <div className="fp-sb-actions">
          <button
            className="btn icon"
            aria-label="Afixar/desafixar sidebar"
            onClick={togglePinned}
          >
            {/* pin */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 3l7 7-4 1-3 6-3-3-6 3 3-6-1-4 7-4Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>

          <button
            className="btn icon"
            aria-label="Expandir/encolher sidebar"
            onClick={toggleCollapsed}
          >
            {/* burger */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* NAV */}
      <nav className="fp-nav" aria-label="Navegação lateral">
        {groups.map((g) => (
          <div key={g.title} className="nav-group">
            <div className="nav-section">{g.title}</div>
            {g.items.map((it) => {
              const active = pathname === it.href || pathname.startsWith(it.href + '/');
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                >
                  <span className="nav-icon"><Icon /></span>
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
