'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  /** Ativa o item quando o pathname começa com este prefixo */
  activePrefix?: string;
  /** Força o estado ativo manualmente (tem prioridade sobre activePrefix) */
  active?: boolean;
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
  const pathname = usePathname() ?? '';

  return (
    <aside className={`w-full md:w-64 shrink-0 ${className}`}>
      <div className="sticky top-0">
        {header ?? null}
        <nav className="p-3 space-y-1">
          {items.map((it) => {
            const isActive =
              typeof it.active === 'boolean'
                ? it.active
                : !!(it.activePrefix && pathname.startsWith(it.activePrefix));
            return (
              <Link
                key={it.href + it.label}
                href={it.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                  ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                `}
              >
                <span className="text-base">{it.icon ?? '•'}</span>
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
