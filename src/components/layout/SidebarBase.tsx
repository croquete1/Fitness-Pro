// src/components/layout/SidebarBase.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

export type NavGroup = { title?: string; items: NavItem[] };

type Brand = { name: string; sub?: string; href?: string; logoSrc?: string };

type Props = { brand: Brand; groups: NavGroup[] };

// ---- Ícones inline (estilo simples, próximos do set inicial)
const Icon = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" />
    </svg>
  ),
  Reports: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 4h14l4 4v12a2 2 0 0 1-2 2H3z" />
      <path d="M17 4v6h6" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1v.2a2 2 0 1 1-4 0v-.2a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H3a2 2 0 1 1 0-4h.2a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.24 3.6l.06.06A1.65 1.65 0 0 0 9 4.6c.37 0 .72-.14 1-.4a1.65 1.65 0 0 0 .4-1V3a2 2 0 1 1 4 0v.2a1.65 1.65 0 0 0 .4 1c.28.26.63.4 1 .4.62 0 1.21-.25 1.58-.64l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.26.28-.4.63-.4 1 0 .37.14.72.4 1 .26.28.61.46 1 .6H21a2 2 0 1 1 0 4h-.2c-.37 0-.72.14-1 .4-.26.28-.46.63-.6 1Z" />
    </svg>
  ),
  Approvals: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Health: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h3l2 5 4-14 2 9h3" />
    </svg>
  ),
  Billing: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M7 15h3" />
    </svg>
  ),
  Chevron: ({ rotated = false }: { rotated?: boolean }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transition: 'transform .18s ease', transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Pin: ({ rotated = false }: { rotated?: boolean }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transition: 'transform .18s ease', transform: rotated ? 'rotate(45deg)' : 'rotate(0deg)' }}>
      <path d="M12 17v5" />
      <path d="M5 8h14l-3 4H8z" />
      <path d="M12 2v2" />
    </svg>
  ),
};

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    const base = href.endsWith('/') ? href : href + '/';
    return pathname === href || (pathname + '/').startsWith(base);
  };

  return (
    <aside className="sb-panel" data-collapsed={collapsed ? '1' : '0'}>
      {/* Brand + actions */}
      <div className="sb-head">
        <Link className="sb-brand" href={brand.href ?? '#'} aria-label={brand.name}>
          {brand.logoSrc ? (
            <img src={brand.logoSrc} alt="" width={28} height={28} className="logo" />
          ) : (
            <div className="logo" />
          )}
          <span className="brand-text">
            <span className="brand-name">{brand.name}</span>
            {brand.sub ? <span className="brand-sub">{brand.sub}</span> : null}
          </span>
        </Link>

        <div className="sb-actions">
          <button className="btn icon" onClick={toggleCollapsed} title={collapsed ? 'Expandir' : 'Compactar'} aria-label={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}>
            <Icon.Chevron rotated={collapsed} />
          </button>
          <button className="btn icon" onClick={togglePinned} title={pinned ? 'Desafixar' : 'Afixar'} aria-label={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'} disabled={collapsed}>
            <Icon.Pin rotated={!pinned} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="sb-nav" role="navigation" aria-label="Menu lateral">
        {groups.map((g, gi) => (
          <section key={gi} className="sb-group">
            {g.title ? <div className="sb-title">{g.title}</div> : null}
            {g.items.map((it, ii) => {
              const active = isActive(it.href, it.exact);
              return (
                <Link key={ii} href={it.href} className="sb-item" data-active={active ? 'true' : 'false'} aria-current={active ? 'page' : undefined}>
                  <span className="sb-icon" aria-hidden>{it.icon}</span>
                  <span className="sb-label">{it.label}</span>
                </Link>
              );
            })}
          </section>
        ))}
      </nav>

      {/* CSS local (usa tokens do theme) */}
      <style jsx>{`
        .sb-panel{
          position: sticky; top: 0; height: 100vh;
          background: var(--sidebar-bg);
          width: var(--sb-col);
          transition: width .25s cubic-bezier(.2,.8,.2,1);
          display: grid; grid-template-rows: auto 1fr;
        }
        .sb-head{ display:grid; grid-template-columns: 1fr auto; align-items:center; gap:8px; padding:10px 12px; }
        .sb-brand{ display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--text); }
        .logo{ width:28px; height:28px; border-radius:8px; background:var(--hover); }
        .brand-text{ display:grid; line-height:1.1; }
        .brand-name{ font-weight:800; }
        .brand-sub{ font-size:11px; color:var(--muted); }
        .sb-actions{ display:flex; gap:8px; }
        .btn.icon{ width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center;
          border-radius:10px; border:1px solid var(--border); background:var(--btn-bg);
          transition: transform .1s ease, background .12s ease, border-color .12s ease; }
        .btn.icon:hover{ background:var(--hover); border-color:var(--border-strong); }
        .btn.icon:active{ transform:translateY(1px); }

        .sb-nav{ padding:12px; overflow:auto; display:flex; flex-direction:column; gap:12px; }
        .sb-group{ display:grid; gap:6px; }
        .sb-title{ font-size:11px; letter-spacing:.6px; color:var(--muted); text-transform:uppercase; margin:6px 8px; }
        .sb-item{ display:flex; align-items:center; gap:10px; padding:10px 12px; margin:2px 0; border-radius:12px; text-decoration:none; color:var(--text);
          border:1px solid transparent; background:transparent; transition: background .12s ease, border-color .12s ease, transform .1s ease; }
        .sb-item:hover{ background:var(--hover); border-color:var(--border); }
        .sb-item:active{ transform:translateY(1px); }
        .sb-item[data-active="true"]{ background:var(--active); border-color:var(--border-strong); }
        .sb-icon{ width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; }
        .sb-label{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* Estado colapsado: esconde os textos e centra os itens */
        .sb-panel[data-collapsed="1"] .brand-text,
        .sb-panel[data-collapsed="1"] .sb-title,
        .sb-panel[data-collapsed="1"] .sb-label{
          opacity:0; visibility:hidden; width:0; max-width:0; pointer-events:none;
        }
        .sb-panel[data-collapsed="1"] .sb-item,
        .sb-panel[data-collapsed="1"] .sb-brand{ justify-content:center; padding:10px; }
      `}</style>
    </aside>
  );
}
