'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  activePrefix?: string | string[];
};

type Props = {
  brand?: { logoSrc?: string; name?: string; href?: string };
  sections: Array<{ title?: string; items: NavItem[] }>;
};

export default function SidebarBase({ brand, sections }: Props) {
  const pathname = usePathname();
  const { pinned, collapsed, togglePinned, toggleCollapsed } = useSidebar();

  const isActive = React.useCallback(
    (item: NavItem) => {
      const prefixes = Array.isArray(item.activePrefix) ? item.activePrefix : item.activePrefix ? [item.activePrefix] : [item.href];
      return prefixes.some((p) => pathname?.startsWith(p));
    },
    [pathname]
  );

  return (
    <aside className="fp-sidebar">
      <div className="fp-sb-head">
        <Link href={brand?.href ?? '/dashboard'} className="fp-sb-brand" aria-label="Ir para dashboard">
          <span className="logo" aria-hidden>
            <Image src={brand?.logoSrc ?? '/logo.svg'} alt="" width={32} height={32} priority />
          </span>
          <strong style={{ fontSize: 15, lineHeight: 1.1 }}>{brand?.name ?? 'Fitness Pro'}</strong>
        </Link>

        <div className="fp-sb-actions">
          <button
            type="button"
            className={`btn icon btn-pin${pinned ? ' is-pinned' : ''}`}
            title={pinned ? 'Desafixar' : 'Afixar'}
            aria-pressed={pinned}
            onClick={togglePinned}
          >
            📌
          </button>
          <button
            type="button"
            className="btn icon btn-toggle"
            title={collapsed ? 'Expandir' : 'Compactar'}
            aria-pressed={collapsed}
            onClick={toggleCollapsed}
          >
            ⇔
          </button>
        </div>
      </div>

      <nav className="fp-nav" aria-label="Navegação principal">
        {sections.map((sec, idx) => (
          <div className="nav-group" key={idx}>
            {sec.title && <div className="nav-section">{sec.title}</div>}
            {sec.items.map((it) => {
              const active = isActive(it);
              return (
                <Link key={it.href} href={it.href} className="nav-item" data-active={active ? 'true' : 'false'}>
                  <span className="nav-icon" aria-hidden>{it.icon ?? <span className="nav-emoji">📄</span>}</span>
                  <span className="nav-label">{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
