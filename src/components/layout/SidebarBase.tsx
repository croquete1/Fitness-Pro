'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

type Item = { label: string; href: string; icon: React.ReactNode };
type Group = { title?: string; items: Item[] };

export type SidebarBaseProps = {
  brand?: React.ReactNode;
  groups: Group[];
};

export default function SidebarBase({ brand, groups }: SidebarBaseProps) {
  const pathname = usePathname();
  const { collapsed, pinned } = useSidebar();

  return (
    <nav
      className="fp-sb-flyout"
      aria-label="Menu lateral"
      style={{ zIndex: 1000 }}
    >
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          {brand}
          <div className="brand-text">
            <span className="brand-name">Fitness Pro</span>
            <span className="brand-sub">Dashboard</span>
          </div>
        </div>
      </div>

      <div className="fp-nav">
        {groups.map((g, gi) => (
          <div key={gi} className="nav-group">
            {g.title ? <div className="nav-section">{g.title}</div> : null}
            {g.items.map((it) => {
              const active = pathname === it.href || pathname.startsWith(it.href + '/');
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  prefetch={false}
                  className="nav-item"
                  data-active={active || undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="nav-icon">{it.icon}</span>
                  <span className="nav-label">{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}

/*  ======= ÍCONES (inline SVG, zero dependências) ======= */
export const Ico = {
  Dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13h8V3H3zM13 21h8v-8h-8zM13 3h8v6h-8zM3 21h8v-6H3z" />
    </svg>
  ),
  Reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18M3 10h18M3 16h18" />
    </svg>
  ),
  Settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
      <path d="M2 12h2M20 12h2M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M17.66 6.34l1.41-1.41M4.93 19.07l1.41-1.41"/>
    </svg>
  ),
  Star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.8 5.5 21 7 14 2 9.3 9 8.5 12 2"/>
    </svg>
  ),
  Users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Health: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-.96-.96a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.74-8.74a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Billing: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
};
