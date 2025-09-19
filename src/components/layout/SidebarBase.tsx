'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  exact?: boolean;
  activePrefix?: string;
  target?: string;
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
  const path = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <motion.aside
      className={`h-full bg-slate-950/95 text-slate-100 border-r border-slate-800 ${className}`}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ overflow: 'hidden' }}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="popLayout">
            {!collapsed && header && (
              <motion.div
                key="header"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: .18 }}
              >
                {header}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          aria-label={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
          onClick={() => setCollapsed((v) => !v)}
          className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-800 hover:bg-slate-900"
          title={collapsed ? 'Expandir' : 'Compactar'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="px-2 pb-3">
        {items.map((it) => {
          const active = it.exact ? path === it.href : (it.activePrefix ? path.startsWith(it.activePrefix) : path.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              target={it.target}
              className={`flex items-center gap-3 rounded-lg px-2 py-2.5 my-1 transition-colors
                ${active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
            >
              <span className="w-5 shrink-0 text-lg">{it.icon ?? '•'}</span>
              <AnimatePresence mode="popLayout">
                {!collapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: .15 }}
                    className="truncate"
                  >
                    {it.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
