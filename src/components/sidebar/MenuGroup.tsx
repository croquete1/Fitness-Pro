// src/components/sidebar/MenuGroup.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import type { UrlObject } from 'url';
import type { NavItem as SharedNavItem, Href } from '@/components/layout/navTypes';

export type MenuItem = SharedNavItem;

type Props = {
  title?: string;
  items: MenuItem[];
  onNavigate?: () => void;
};

function toPath(href: Href): string {
  if (typeof href === 'string') return href;
  const obj = href as UrlObject;
  return typeof obj.pathname === 'string' ? obj.pathname : '/';
}

export default function MenuGroup({ title, items, onNavigate }: Props) {
  const pathname = usePathname() || '/';

  const isActive = (item: MenuItem) => {
    const current = pathname;
    const target = toPath(item.href);

    if (item.activePrefix) {
      const arr = Array.isArray(item.activePrefix) ? item.activePrefix : [item.activePrefix];
      if (arr.some((p) => current.startsWith(p))) return true;
    }
    return current === target || current.startsWith(target + '/');
  };

  return (
    <div className="nav-group">
      {title && <div className="nav-section">{title}</div>}

      <div className="nav-sublist" style={{ display: 'grid', gap: 6 }}>
        {items.map((it) => {
          const href =
            typeof it.href === 'string'
              ? (it.href as Route) // ✅ typed routes ok
              : (it.href as UrlObject);

          const active = isActive(it);
          const key = String((it.href as any)?.pathname ?? it.href);

          return (
            <Link
              key={key}
              href={href}
              onClick={onNavigate}
              className="nav-subitem"
              data-active={active ? 'true' : 'false'}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr auto',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 10,
              }}
            >
              <span className="nav-icon">{it.icon}</span>
              <span className="nav-label">{it.label}</span>
              {it.badge && <span>{it.badge}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
