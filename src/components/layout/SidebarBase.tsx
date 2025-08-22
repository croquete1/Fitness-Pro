// src/components/layout/SidebarBase.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, ReactNode } from 'react';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  /** Opcional: lógica custom para "active". Por omissão: pathname.startsWith(href) */
  isActive?(pathname: string): boolean;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export type Brand = {
  name: string;
  sub?: string;
  href?: string;
  logoSrc?: string;
  logoAlt?: string;
  /** Tamanho do logo (default: 28x28) */
  logoSize?: { width: number; height: number };
};

type SidebarBaseProps = {
  brand: Brand;
  groups: NavGroup[];
  /** Permite injectar botões extra no cabeçalho (ex.: switch de tema) */
  headerActions?: ReactNode;
};

export default function SidebarBase({
  brand,
  groups,
  headerActions,
}: PropsWithChildren<SidebarBaseProps>) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  // clicando num link enquanto estamos em "peek" (collapsed && !pinned),
  // deixamos a sidebar colapsada após a navegação (comportamento natural).
  // Não precisamos de alterar estado aqui.

  return (
    <div
      className="fp-sb-flyout"
      role="navigation"
      aria-label="Menu principal"
      // garante que é clicável mesmo que o <aside> do layout tenha pointerEvents: none
      style={{ pointerEvents: 'auto', zIndex: 70 }}
    >
      {/* HEAD */}
      <div className="fp-sb-head">
        <BrandLink brand={brand} />
        <div className="fp-sb-actions">
          {/* Collapse / Expand */}
          <button
            type="button"
            className="btn icon"
            aria-label={collapsed && !pinned ? 'Expandir sidebar (peek)' : 'Colapsar sidebar'}
            title={collapsed && !pinned ? 'Expandir' : 'Colapsar'}
            onClick={toggleCollapsed}
          >
            {/* chevron duplo esq/dir simples em SVG */}
            {collapsed && !pinned ? (
              <ChevronRightDouble />
            ) : (
              <ChevronLeftDouble />
            )}
          </button>

          {/* Pin / Unpin */}
          <button
            type="button"
            className="btn icon"
            aria-pressed={pinned}
            aria-label={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
            title={pinned ? 'Desafixar' : 'Afixar'}
            onClick={togglePinned}
          >
            {pinned ? <PinSolid /> : <PinOutline />}
          </button>

          {headerActions}
        </div>
      </div>

      {/* NAV */}
      <div className="fp-nav">
        {groups.map((g, i) => (
          <div key={i} className="nav-group">
            {g.title ? <div className="nav-section">{g.title}</div> : null}
            {g.items.map((it, j) => {
              const active =
                typeof it.isActive === 'function'
                  ? it.isActive(pathname)
                  : normalizeActive(pathname, it.href);
              return (
                <Link
                  key={j}
                  href={it.href}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {it.icon ?? <CircleDot />}
                  </span>
                  <span className="nav-label">{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function normalizeActive(pathname: string, href: string) {
  // ignora trailing slash nos dois lados
  const p = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const h = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href;
  // marca ativo quando o path começa pelo href (bom para rotas /dashboard/admin/…)
  return p === h || p.startsWith(h + '/');
}

function BrandLink({ brand }: { brand: Brand }) {
  const {
    href = '/dashboard',
    name,
    sub,
    logoAlt = 'Logo',
    logoSrc = '/logo.svg',
    logoSize = { width: 28, height: 28 },
  } = brand;

  return (
    <Link href={href} className="fp-sb-brand">
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={logoSize.width}
        height={logoSize.height}
        className="logo"
        priority
      />
      <span className="brand-text">
        <span className="brand-name">{name}</span>
        {sub ? <span className="brand-sub">{sub}</span> : null}
      </span>
    </Link>
  );
}

/* ---------------- pequenos ícones SVG (sem dependências) ---------------- */

function ChevronLeftDouble(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        d="M11.5 6l-5 6 5 6M18.5 6l-5 6 5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightDouble(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        d="M12.5 6l5 6-5 6M5.5 6l5 6-5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinOutline(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        d="M16 3l5 5-4 4 2 2-6 6-2-2-4 2 2-4-2-2 4-4-5-5 5 1 4-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PinSolid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        d="M16 3l5 5-4 4 2 2-6 6-2-2-4 2 2-4-2-2 4-4-5-5 5 1 4-3z"
        fill="currentColor"
      />
    </svg>
  );
}

function CircleDot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}
