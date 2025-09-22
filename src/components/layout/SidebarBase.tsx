'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from './SidebarProvider';

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  /** Quando definido, a “atividade” usa este prefixo em vez do href */
  activePrefix?: string;
  /** Igualdade exata (sem startsWith) */
  exact?: boolean;
  /** Força ativo externamente (fallback) */
  active?: boolean;
};

export default function SidebarBase({
  items,
  header,
  className,
  footer,
  width = 240,
  collapsedWidth = 72,
}: {
  items: NavItem[];
  header?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  width?: number;
  collapsedWidth?: number;
}) {
  const path = usePathname();
  const { collapsed, peek, setPeek, toggle, mobileOpen, closeMobile } = useSidebar();

  const activeIndex = React.useMemo(() => {
    let idx = -1;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const base = it.activePrefix ?? it.href;
      const isActive = it.exact ? path === base : path.startsWith(base);
      if ((isActive || it.active) && idx === -1) idx = i;
    }
    return idx;
  }, [items, path]);

  const isMobile = useIsMobile();
  const computedWidth = collapsed && !peek ? collapsedWidth : width;

  // Variantes framer para conteúdo (texto) entrar/sair
  const textVariants = {
    initial: { opacity: 0, x: -6 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.15 } },
    exit: { opacity: 0, x: -6, transition: { duration: 0.12 } },
  };

  // Backdrop do drawer em mobile
  const Backdrop = () =>
    isMobile ? (
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            onClick={closeMobile}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--mui-palette-common-black)',
              zIndex: 1200,
            }}
          />
        )}
      </AnimatePresence>
    ) : null;

  return (
    <>
      <Backdrop />
      <motion.aside
        role="navigation"
        aria-label="Menu lateral"
        className={className}
        onMouseEnter={() => setPeek(true)}
        onMouseLeave={() => setPeek(false)}
        initial={false}
        animate={{
          width: computedWidth,
          x: isMobile ? (mobileOpen ? 0 : -computedWidth - 8) : 0,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{
          position: isMobile ? 'fixed' : 'relative',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1210,
          overflow: 'hidden',
        }}
      >
        <Paper
          square
          elevation={isMobile ? 8 : 0}
          sx={{
            height: '100%',
            width: '100%',
            borderRight: '1px solid var(--mui-palette-divider)',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Cabeçalho */}
          <div
            className="flex items-center justify-between px-3 py-3"
            style={{ minHeight: 56 }}
          >
            <div className="min-w-0">
              <AnimatePresence mode="popLayout">
                {(!collapsed || peek) && header && (
                  <motion.div
                    key="header"
                    variants={textVariants}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                  >
                    {header}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botão fechar em mobile / colapsar em desktop */}
            {isMobile ? (
              <IconButton
                size="small"
                aria-label="Fechar menu"
                onClick={closeMobile}
                sx={{ ml: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                aria-label={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
                onClick={toggle}
                sx={{ ml: 1 }}
              >
                {collapsed ? (
                  <ChevronRightIcon fontSize="small" />
                ) : (
                  <ChevronLeftIcon fontSize="small" />
                )}
              </IconButton>
            )}
          </div>

          <Divider />

          {/* Lista de navegação */}
          <nav className="px-2 flex-1 overflow-y-auto">
            <ul className="list-none m-0 p-0">
              {items.map((it, i) => {
                const active = i === activeIndex || !!it.active;

                const baseCls =
                  'flex items-center gap-2 rounded-md px-2 py-2 mb-1 no-underline transition-colors outline-none focus:ring-2 focus:ring-indigo-400/40';
                const stateCls = active
                  ? 'bg-[rgba(99,102,241,.15)] ring-1 ring-indigo-300/30 text-indigo-600 dark:text-indigo-200'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-white/5';

                return (
                  <li key={it.href}>
                    <Tooltip
                      title={collapsed && !peek ? it.label : ''}
                      placement="right"
                    >
                      <Link
                        href={it.href}
                        aria-current={active ? 'page' : undefined}
                        className={`${baseCls} ${stateCls}`}
                        data-active={active ? '1' : '0'}
                      >
                        {it.icon && (
                          <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                            {it.icon}
                          </span>
                        )}

                        <AnimatePresence mode="popLayout">
                          {(!collapsed || peek) && (
                            <motion.span
                              key="label"
                              variants={textVariants}
                              initial="initial"
                              animate="enter"
                              exit="exit"
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

          {/* Rodapé opcional (ex.: tema/perfil) */}
          {footer && (
            <>
              <Divider />
              <div className="px-3 py-2">{footer}</div>
            </>
          )}
        </Paper>
      </motion.aside>
    </>
  );
}

/** Hook simples para detetar mobile (<= 1024px) */
function useIsMobile() {
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 1024px)');
    const onChange = () => setMobile(mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);
  return mobile;
}
