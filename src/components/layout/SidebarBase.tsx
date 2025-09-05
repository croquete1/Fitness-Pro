// src/components/layout/SidebarBase.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import type { UrlObject } from 'url';
import type { NavItem as SharedNavItem, Href } from './navTypes';

export type SidebarItem = SharedNavItem; // alias p/ compatibilidade

type Props = {
  items: SidebarItem[];
  onNavigate?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

function toPath(href: Href): string {
  if (typeof href === 'string') return href;
  const obj = href as UrlObject;
  return typeof obj.pathname === 'string' ? obj.pathname : '/';
}

export default function SidebarBase({ items, onNavigate, header, footer }: Props) {
  const pathname = usePathname() || '/';

  const isActive = (href: Href, activePrefix?: string | string[]) => {
    const current = pathname;
    const target = toPath(href);

    if (activePrefix) {
      const arr = Array.isArray(activePrefix) ? activePrefix : [activePrefix];
      if (arr.some((p) => current.startsWith(p))) return true;
    }
    return current === target || current.startsWith(String(target) + '/');
  };

  return (
    <nav className="fp-sidebar" aria-label="Navegação">
      {header}
      <div className="fp-nav">
        {items.map((item) => {
          const href =
            typeof item.href === 'string'
              ? (item.href as Route) // ✅ typed routes ok
              : (item.href as UrlObject);

          const key = String((item.href as any)?.pathname ?? item.href);

          return (
            <div key={key} style={{ marginBottom: 6 }}>
              <Link
                href={href}
                onClick={onNavigate}
                className="nav-item"
                data-active={isActive(item.href, item.activePrefix) ? 'true' : 'false'}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 12,
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </div>
          );
        })}
      </div>
      {footer}
    </nav>
  );
}
