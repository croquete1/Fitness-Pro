'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  activePrefix?: string;
  exact?: boolean;
  active?: boolean;
};

export default function SidebarBase({
  items,
  header,
  className,
}: {
  items: NavItem[];
  header?: React.ReactNode;
  className?: string;
}) {
  const path = usePathname();
  const { collapsed, peek, setPeek, toggle } = useSidebar();

  const activeIndex = React.useMemo(() => {
    let idx = -1;
    items.forEach((it, i) => {
      const act = it.exact
        ? path === it.href
        : (it.activePrefix ? path.startsWith(it.activePrefix) : path.startsWith(it.href));
      if (act && idx === -1) idx = i;
    });
    return idx;
  }, [items, path]);

  const widthPx = collapsed && !peek ? 72 : 240;

  return (
    <motion.aside
      className={className}
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
      animate={{ width: widthPx }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ overflow: 'hidden', borderRight: '1px solid var(--mui-palette-divider)' }}
    >
      <div className="flex items-center justify-between px-3 py-3" style={{ minHeight: 56 }}>
        <div className="min-w-0">
          <AnimatePresence mode="popLayout">
            {(!collapsed || peek) && header && (
              <motion.div
                key="header"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {header}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <IconButton size="small" onClick={toggle} sx={{ ml: 1 }}>
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </div>

      <nav className="px-2">
        <ul className="list-none m-0 p-0">
          {items.map((it, i) => {
            const active = i === activeIndex || it.active;
            const baseCls =
              'flex items-center gap-2 rounded-md px-2 py-2 mb-1 no-underline transition-colors';
            const stateCls = active
              ? 'bg-[rgba(99,102,241,.15)] text-indigo-600 dark:text-indigo-300'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-white/5';
            return (
              <li key={it.href}>
                <Tooltip title={collapsed && !peek ? it.label : ''} placement="right">
                  <Link href={it.href} aria-current={active ? 'page' : undefined} className={`${baseCls} ${stateCls}`}>
                    {it.icon && (
                      <span className="shrink-0 w-5 h-5 flex items-center justify-center">{it.icon}</span>
                    )}
                    <AnimatePresence mode="popLayout">
                      {(!collapsed || peek) && (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className="truncate"
                        >
                          {it.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
}
