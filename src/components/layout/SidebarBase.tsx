// src/components/layout/SidebarBase.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;        // opcional — se vier, tem prioridade
  activePrefix?: string;   // opcional — fallback para calcular active via pathname
};

export default function SidebarBase({
  items,
  header,
  className = '',
}: {
  items: NavItem[];
  header?: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobile, peek, setPeek } = useSidebar();

  const base =
    'fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out ' +
    'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm';
  const mobile = mobileOpen ? 'translate-x-0' : '-translate-x-full';
  const desktop =
    'lg:static lg:translate-x-0 lg:block ' +
    (collapsed && !peek ? 'lg:w-[72px]' : 'lg:w-[260px]');

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={`${base} ${mobile} ${desktop} ${className}`}
        onMouseEnter={() => setPeek(true)}
        onMouseLeave={() => setPeek(false)}
      >
        <div className="h-full flex flex-col">
          {header && (
            <div className="h-14 flex items-center gap-3 px-3 border-b border-slate-200/80 dark:border-slate-800/80">
              {header}
            </div>
          )}

          <nav className="p-2 space-y-1 overflow-y-auto">
            {items.map((it) => {
              const isActive =
                it.active ??
                (pathname ? pathname.startsWith(it.activePrefix ?? it.href) : false);

              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={[
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-700'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
                  ].join(' ')}
                  onClick={closeMobile}
                >
                  {it.icon && <span className="shrink-0">{it.icon}</span>}
                  <span className={`truncate ${collapsed && !peek ? 'lg:hidden' : ''}`}>
                    {it.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
