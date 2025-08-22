'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pin, PinOff, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useSidebar } from '@/components/layout/SidebarWrapper';
import Image from 'next/image';

export type Item = { href: string; label: string; icon: React.ReactNode; exact?: boolean };
export type Group = { title: string; items: Item[] };
export type SidebarBaseProps = { nav: Group[]; showToggle?: boolean };

function isActive(pathname: string, href: string, exact?: boolean) {
  const clean = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return exact ? clean === href : (clean === href || clean.startsWith(href + '/'));
}

export default function SidebarBase({ nav, showToggle = true }: SidebarBaseProps) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  return (
    <div className="fp-sb-flyout" data-pinned={pinned ? '1' : '0'}>
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Fitness Pro">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="logo" />
          <span className="brand-text">
            <span className="brand-name">Fitness Pro</span>
            <span className="brand-sub">Dashboard</span>
          </span>
        </Link>

        {showToggle && (
          <div className="fp-sb-actions">
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
          </div>
        )}
      </div>

      <nav className="fp-nav">
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
      </nav>
    </div>
  );
}
