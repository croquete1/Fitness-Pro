'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pin, PinOff, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useSidebar } from './SidebarProvider';

export type NavItem = { label: string; href: string; icon?: React.ReactNode };
export type NavGroup = { title?: string; items: NavItem[] };

type Props = { brand?: React.ReactNode; groups: NavGroup[] };

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();

  // -------- calcular "o" link ativo (o mais específico) --------
  const norm = (s: string) => s.replace(/\/+$/, ''); // remove trailing slash
  const path = norm(pathname);

  const itemsFlat = React.useMemo(
    () => groups.flatMap((g) => g.items),
    [groups]
  );

  const bestHref = React.useMemo(() => {
    let best = '';
    for (const it of itemsFlat) {
      const h = norm(it.href);
      const matches =
        path === h || (h !== '' && path.startsWith(h + '/')); // exige limite "/"
      if (matches && h.length > best.length) best = h;
    }
    return best; // string vazia = nenhum ativo
  }, [itemsFlat, path]);

  return (
    <aside className="fp-sb-flyout" aria-label="Sidebar">
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Início">
          {brand}
        </Link>

        <div className="fp-sb-actions">
          <button
            className="btn icon"
            type="button"
            onClick={togglePinned}
            title={pinned ? 'Desafixar (auto-ocultar)' : 'Afixar'}
            aria-pressed={pinned}
          >
            {pinned ? <Pin size={16} /> : <PinOff size={16} />}
          </button>

          <button
            className="btn icon"
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir' : 'Compactar'}
            aria-pressed={collapsed}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </div>

      <nav className="fp-nav">
        {groups.map((g, idx) => (
          <div key={idx} className="nav-group">
            {g.title ? <div className="nav-section">{g.title}</div> : null}
            {g.items.map((it) => {
              const active = norm(it.href) === bestHref; // <- só 1 fica ativo
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                >
                  {it.icon ? <span className="nav-icon">{it.icon}</span> : null}
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
