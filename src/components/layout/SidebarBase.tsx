'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Pin, PinOff, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useSidebar } from '@/components/SidebarWrapper';

/** Tipos base (não precisam ser importados noutros ficheiros) */
type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};
type NavGroup = { title: string; items: NavItem[] };

/** Props do componente base */
export type SidebarBaseProps = {
  nav: NavGroup[];
  /** Mostra/oculta o botão de colapsar/expandir (default: true) */
  showToggle?: boolean;
  /** Caminho do logo (default: /logo.png) */
  logoSrc?: string;
  /** Nome da marca (default: "Fitness Pro") */
  brandName?: string;
  /** Subtítulo por baixo do nome (opcional) */
  brandSub?: string;
};

function isActive(pathname: string, href: string, exact?: boolean) {
  const clean =
    pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (exact || href === '/dashboard') return clean === href;
  return clean === href || clean.startsWith(href + '/');
}

/**
 * Componente base da sidebar.
 * Estrutura 100% compatível com o teu sidebar.css:
 * - .fp-sb-flyout (painel sticky que desliza)
 * - .fp-nav       (contentor interno)
 * - .nav-brand    (logo+texto)
 * - .nav-tools    (botões pin/toggle no topo-direito)
 */
export default function SidebarBase({
  nav,
  showToggle = true,
  logoSrc = '/logo.png',
  brandName = 'Fitness Pro',
  brandSub,
}: SidebarBaseProps) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  return (
    <div className="fp-sb-flyout" role="navigation" aria-label="Sidebar">
      <div className="fp-nav">
        {/* BRAND */}
        <Link href="/dashboard" className="nav-brand" aria-label="Ir para o dashboard">
          {/* O teu CSS define .brand-logo (28x28). A imagem respeita esse tamanho. */}
          <img src={logoSrc} alt="Logo" className="brand-logo" />
          <span className="brand-text">
            <span className="brand-name">{brandName}</span>
            {brandSub ? <span className="brand-sub">{brandSub}</span> : null}
          </span>
        </Link>

        {/* TOOLS (topo-direito) */}
        <div className="nav-tools">
          <button
            type="button"
            className="btn icon"
            aria-label={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
            title={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}
            onClick={togglePinned}
            data-role="sb-pin"
          >
            {pinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>

          {showToggle && (
            <button
              type="button"
              className="btn icon"
              aria-label={collapsed ? 'Expandir menu' : 'Encolher para ícones'}
              title={collapsed ? 'Expandir menu' : 'Encolher para ícones'}
              onClick={toggleCollapsed}
              data-role="sb-toggle"
            >
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>
          )}
        </div>

        {/* NAV */}
        {nav.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="nav-section">{group.title}</div>
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-item"
                  data-active={active ? 'true' : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
