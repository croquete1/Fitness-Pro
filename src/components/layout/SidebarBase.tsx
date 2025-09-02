'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useSidebar } from './SidebarProvider';

type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  /** paths adicionais que contam como “ativo” (ex.: /users/123) */
  match?: string[];
};
type NavGroup = { label?: string; items: NavItem[] };

type Props = {
  brand?: ReactNode;
  groups: NavGroup[];
};

function isMatch(pathname: string, href: string, extra?: string[]) {
  const clean = (s: string) => s.replace(/\/+$/, '');
  const p = clean(pathname);
  const h = clean(href);
  if (p === h || p.startsWith(h + '/')) return true;
  return (extra || []).some((m) => (p === clean(m) || p.startsWith(clean(m) + '/')));
}

export default function SidebarBase({ brand, groups }: Props) {
  const pathname = usePathname();
  const { open, closeSidebar, collapsed, toggleCollapsed, pinned } = useSidebar();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={[
          'fixed z-50 inset-y-0 left-0',
          'bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800',
          'transition-transform md:transition-[width] will-change-transform',
          'w-[260px] md:w-[260px]',
          collapsed ? 'md:w-[76px]' : 'md:w-[260px]',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        role="navigation"
        aria-label="Admin sidebar"
      >
        {/* Header / Brand */}
        <div className="flex items-center gap-2 px-3 h-14 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex-1 min-w-0">{brand}</div>

          {/* Botão colapsar (desktop) */}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            className="hidden md:inline-flex h-8 w-8 items-center justify-center rounded-full
                       border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900"
            title="Colapsar"
          >
            {/* chevron */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d={collapsed ? 'M10 6l6 6-6 6' : 'M14 6l-6 6 6 6'}
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Navegação */}
        <nav className="py-3 space-y-2 overflow-y-auto h-[calc(100vh-56px)]">
          {groups.map((g, gi) => (
            <div key={gi}>
              {g.label && (
                <div
                  className={[
                    'px-4 text-[11px] uppercase tracking-wide mb-2 text-neutral-500',
                    collapsed ? 'opacity-0 md:opacity-0' : '',
                  ].join(' ')}
                >
                  {g.label}
                </div>
              )}
              <ul className="px-2 space-y-1">
                {g.items.map((it, ii) => {
                  const active = isMatch(pathname, it.href, it.match);
                  return (
                    <li key={ii}>
                      <Link
                        href={it.href}
                        className={[
                          'flex items-center gap-3 rounded-lg px-3 h-10',
                          active
                            ? 'bg-neutral-100 dark:bg-neutral-800 font-medium'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-900',
                        ].join(' ')}
                      >
                        <span className="shrink-0">{it.icon}</span>
                        <span className={collapsed ? 'hidden md:hidden' : 'truncate'}>
                          {it.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Empurrar o conteúdo quando a sidebar está presente (desktop) */}
      <div className={['hidden md:block', collapsed ? 'w-[76px]' : 'w-[260px]'] .join(' ')} />
    </>
  );
}