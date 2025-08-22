// src/components/layout/SidebarBase.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  exact?: boolean;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

type Brand = {
  name: string;
  sub?: string;
  href?: string;
  logoSrc?: string;
};

type Props = {
  brand: Brand;
  groups: NavGroup[];
};

/** Chevrons simples para os botões do header */
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function Pin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17v5" />
      <path d="M5 8l14 0-3 4H8z" />
      <path d="M12 2v2" />
    </svg>
  );
}

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  // detecção de ativo estável
  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    // evita marcar /dashboard como ativo quando estamos em /dashboard-xyz
    const withSlash = item.href.endsWith('/') ? item.href : item.href + '/';
    return pathname === item.href || (pathname + '/').startsWith(withSlash);
  };

  return (
    <div
      className="fp-sb-flyout"
      // a sidebar é fixed; tem de aceitar cliques SEM bloquear o grid
      style={{
        pointerEvents: 'auto',
        zIndex: 90,
      }}
      data-testid="fp-sidebar"
    >
      {/* HEAD */}
      <div className="fp-sb-head">
        <Link className="fp-sb-brand" href={brand.href ?? '#'} aria-label={brand.name}>
          {/* usa <img> simples para não forçar next/image em layout fixed */}
          {brand.logoSrc ? (
            <img src={brand.logoSrc} alt="" className="logo" width={28} height={28} />
          ) : (
            <div className="logo" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--hover)' }} />
          )}
          <span className="brand-text">
            <span className="brand-name">{brand.name}</span>
            {brand.sub ? <span className="brand-sub">{brand.sub}</span> : null}
          </span>
        </Link>

        <div className="fp-sb-actions">
          {/* Collapse/Expand */}
          <button
            type="button"
            className="btn icon"
            aria-label={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
            title={collapsed ? 'Expandir' : 'Compactar'}
            onClick={toggleCollapsed}
          >
            <ChevronLeft
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 180ms ease',
              }}
            />
          </button>

          {/* Pin/Unpin (apenas tem efeito quando expandida) */}
          <button
            type="button"
            className="btn icon"
            aria-label={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
            title={pinned ? 'Desafixar' : 'Afixar'}
            onClick={togglePinned}
            disabled={collapsed}
            style={{ opacity: collapsed ? 0.5 : 1 }}
          >
            <Pin style={{ transform: pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'transform 180ms ease' }} />
          </button>
        </div>
      </div>

      {/* NAV */}
      <nav className="fp-nav" role="navigation" aria-label="Menu lateral">
        {groups.map((g, gi) => (
          <section key={gi} className="nav-group">
            {g.title ? <div className="nav-section">{g.title}</div> : null}

            {g.items.map((item, ii) => {
              const active = isActive(item);
              return (
                <Link
                  prefetch
                  key={ii}
                  href={item.href}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="nav-icon" aria-hidden>
                    {item.icon ?? <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor', display: 'inline-block' }} />}
                  </span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </section>
        ))}
      </nav>
    </div>
  );
}
