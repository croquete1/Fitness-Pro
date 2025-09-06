'use client';

import Link from 'next/link';
import type { UrlObject } from 'url';
import type { Route } from 'next';
import React from 'react';

export type NavItem = {
  href: Route | UrlObject;
  label: string;
  icon?: React.ReactNode;
  kpi?: string | number;
};

export default function SidebarBase({
  items,
  userLabel,
  onNavigate,
}: {
  items: NavItem[];
  userLabel: string;
  onNavigate?: () => void;
}) {
  return (
    <aside
      className="sidebar"
      style={{
        padding: 12,
        display: 'grid',
        gap: 8,
        borderRight: '1px solid var(--border)',
        background: 'var(--sidebar-bg)',
      }}
    >
      <div
        className="user"
        style={{ fontWeight: 700, padding: '6px 8px', borderRadius: 8, background: 'var(--sidebar-active)' }}
      >
        {userLabel}
      </div>

      <nav className="nav" style={{ display: 'grid', gap: 6 }}>
        {items.map((it) => (
          <div key={typeof it.href === 'string' ? it.href : (it.href as UrlObject).pathname} style={{ marginBottom: 2 }}>
            <Link
              href={it.href}
              onClick={onNavigate}
              className="nav-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
              }}
            >
              <span aria-hidden>{it.icon ?? '•'}</span>
              <span style={{ flex: 1 }}>{it.label}</span>
              {typeof it.kpi !== 'undefined' && (
                <span className="chip" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {it.kpi}
                </span>
              )}
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
}
