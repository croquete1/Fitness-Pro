// src/components/layout/SidebarBase.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import type { UrlObject } from 'url';

export type NavItem = {
  href: Route | UrlObject;
  label: string;
  icon?: React.ReactNode;
  /** Usado para marcar ativo por prefixo; por omissão usa o pathname do href (se string) */
  activePrefix?: string;
  /** Pequeno badge numérico/texto opcional */
  badge?: number | string;
};

type Props = {
  items: NavItem[];
  /** Mostrado apenas no header “default”; se passares `header`, é ignorado */
  userLabel?: string;
  /** Cabeçalho custom (logo, ações, etc). Se não for passado, uso um header simples com userLabel */
  header?: React.ReactNode;
  onNavigate?: () => void;
  /** True = começa colapsada (lido depois pelo localStorage se existir) */
  collapsedDefault?: boolean;
  /** Chave para guardar o estado no localStorage */
  storageKey?: string;
};

const LS_KEY_DEFAULT = 'fp.sidebar.collapsed';

function toPathname(href: Route | UrlObject): string | null {
  if (typeof href === 'string') return href;
  if (href && typeof href === 'object') {
    if (typeof href.pathname === 'string') return href.pathname;
  }
  return null;
}

export default function SidebarBase({
  items,
  userLabel,
  header,
  onNavigate,
  collapsedDefault = false,
  storageKey = LS_KEY_DEFAULT,
}: Props) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return collapsedDefault;
    try {
      const fromLS = localStorage.getItem(storageKey);
      if (fromLS != null) return fromLS === '1';
    } catch {}
    return collapsedDefault;
  });

  React.useEffect(() => {
    try { localStorage.setItem(storageKey, collapsed ? '1' : '0'); } catch {}
  }, [collapsed, storageKey]);

  const defaultHeader = (
    <div
      className="fp-sb-head"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, padding: 8
      }}
    >
      <div className="fp-sb-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="logo" aria-label="Fitness Pro" style={{ fontSize: 20, lineHeight: 1, background: 'transparent' }}>💪</button>
        <div
          style={{
            overflow: 'hidden',
            transition: 'opacity .18s ease, max-width .18s ease',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 500,
            pointerEvents: collapsed ? 'none' : 'auto',
          }}
        >
          <div className="brand-name" style={{ fontWeight: 800 }}>Fitness Pro</div>
          {!!userLabel && (
            <div
              className="small text-muted"
              title={userLabel}
              style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {userLabel}
            </div>
          )}
        </div>
      </div>

      {/* Toggle collapse/expand */}
      <button
        className="btn ghost"
        type="button"
        aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        aria-pressed={collapsed}
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? 'Expandir' : 'Colapsar'}
        style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '6px 8px',
          background: 'var(--panel)',
          cursor: 'pointer',
        }}
      >
        {collapsed ? '»' : '«'}
      </button>
    </div>
  );

  return (
    <aside
      className="fp-sidebar"
      data-collapsed={collapsed ? 'true' : 'false'}
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        height: '100%',
        width: collapsed ? 72 : 260,
        transition: 'width .2s ease',
        borderRight: '1px solid var(--border)',
        background: 'var(--sidebar-bg)',
      }}
    >
      {/* header custom ou default */}
      <div>{header ?? defaultHeader}</div>

      {/* nav */}
      <nav aria-label="Principal" style={{ padding: 8 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 }}>
          {items.map((item) => {
            const pref = item.activePrefix || toPathname(item.href) || '';
            const active = !!(pref && pathname?.startsWith(pref));
            const key = (typeof item.href === 'string' ? item.href : toPathname(item.href)) ?? item.label;

            return (
              <li key={key}>
                <Link
                  href={item.href as Route | UrlObject}
                  onClick={onNavigate}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: active ? 'var(--sidebar-active)' : 'transparent',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  {item.icon ?? <span aria-hidden>•</span>}

                  {/* Título com fade quando colapsado */}
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'opacity .18s ease, max-width .18s ease',
                      opacity: collapsed ? 0 : 1,
                      maxWidth: collapsed ? 0 : 500,
                      pointerEvents: collapsed ? 'none' : 'auto',
                    }}
                  >
                    {item.label}
                  </span>

                  {item.badge != null && !collapsed && (
                    <span
                      className="chip"
                      aria-label="indicador"
                      style={{
                        padding: '2px 6px',
                        borderRadius: 999,
                        border: '1px solid var(--border)',
                        fontSize: 12,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
