// src/components/layout/SidebarBase.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSidebar } from './SidebarProvider';

export type Item = {
  label: string;
  href: string;
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  /** regra opcional para “activo” (por omissão: exacto ou prefixo com /) */
  isActive?: (pathname: string) => boolean;
};
export type Group = { title?: string; items: Item[] };

type Props = {
  brand?: React.ReactNode;
  groups: Group[];
};

const baseIcon = (d: string) =>
  function Icon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    );
  };

// Ícones (simples e leves, inline)
export const Ico = {
  Dashboard: baseIcon('M3 12h7V3H3v9Zm11 9h7v-9h-7v9ZM3 21h7v-7H3v7Zm11-9h7V3h-7v9Z'),
  Reports:   baseIcon('M4 4h12l4 4v12H4V4Zm12 0v4h4'),
  Settings:  baseIcon('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0l-2 1 1 2-2 2-2-1-1 2H10l-1-2-2 1-2-2 1-2-2-1V9l2-1-1-2 2-2 2 1 1-2h4l1 2 2-1 2 2-1 2 2 1v4Z'),
  Users:     baseIcon('M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm6 11v-1a4 4 0 0 0-3-3'),
  Star:      baseIcon('M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8-5-4.9 6.9-1L12 2Z'),
  Health:    baseIcon('M20.8 11.3C18 14 15 17 12 20 9 17 6 14 3.2 11.3a5.6 5.6 0 1 1 7.9-7.9L12 4.3l.9-.9a5.6 5.6 0 1 1 7.9 7.9Z'),
  Billing:   baseIcon('M3 7h18v10H3V7Zm0-2h18M6 12h6'),
};

function defaultIsActive(href: string) {
  return (pathname: string) => pathname === href || pathname.startsWith(href + '/');
}

function NavItem({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon ?? Ico.Dashboard;
  return (
    <Link
      href={item.href}
      className="nav-item"
      data-active={active ? 'true' : 'false'}
    >
      <span className="nav-icon">
        <Icon />
      </span>
      <span className="nav-label">{item.label}</span>
    </Link>
  );
}

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();

  // Usamos apenas as ações; ignoramos collapsed/pinned para não gerar lint errors
  const { toggleCollapsed, togglePinned } = useSidebar(); // collapsed/pinned não são necessários aqui

  return (
    <div className="fp-sb-flyout">
      {/* Head / Brand */}
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Início">
          {/* se não passarem brand, mostramos o logótipo por omissão */}
          {brand ?? (
            <>
              <Image src="/logo.svg" alt="" width={28} height={28} className="logo" priority />
              <span className="brand-text">
                <span className="brand-name">Fitness Pro</span>
                <span className="brand-sub">Dashboard</span>
              </span>
            </>
          )}
        </Link>

        <div className="fp-sb-actions">
          <button
            type="button"
            className="btn icon"
            title="Afixar/Desafixar"
            onClick={togglePinned}
            aria-label="Afixar/Desafixar sidebar"
          >
            <Ico.Star />
          </button>
          <button
            type="button"
            className="btn icon"
            title="Expandir/Compactar"
            onClick={toggleCollapsed}
            aria-label="Expandir/Compactar sidebar"
          >
            <Ico.Settings />
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        {groups.map((g, gi) => (
          <div className="nav-group" key={gi}>
            {g.title && <div className="nav-section">{g.title}</div>}
            {g.items.map((item, ii) => {
              const isActive = (item.isActive ?? defaultIsActive(item.href))(pathname);
              return <NavItem key={ii} item={item} active={isActive} />;
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
