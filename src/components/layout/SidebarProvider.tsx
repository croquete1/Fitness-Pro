'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useMediaQuery, useTheme } from '@mui/material';

export type SidebarCtx = {
  /** Estado “rail/painel” no desktop */
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapse: () => void;

  /** Estado drawer no mobile */
  isMobile: boolean;
  mobileOpen: boolean;
  openMobile: (v: boolean) => void;
  closeMobile: () => void;

  /** 🔁 Aliases/compat de versões antigas (para evitar regressões) */
  toggle: () => void;            // alias de toggleCollapse
  railWidth: number;             // para componentes antigos que ainda leem valores
  panelWidth: number;
  peek: boolean;                 // “hover peeker” (se não usares, fica sempre false)
  setPeek: (v: boolean) => void; // no-op seguro se não for usado
};

const SidebarContext = React.createContext<SidebarCtx | undefined>(undefined);

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // < 1200px ~ drawer
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [peek, setPeek] = React.useState(false);

  // Larguras “canónicas” (também usadas no CSS global)
  const railWidth = 64;
  const panelWidth = 260;

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((v) => !v);
  }, []);

  const openMobile = React.useCallback((v: boolean) => {
    setMobileOpen(!!v);
    // reflete no <html> para CSS (drawer)
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.sbMobileOpen = v ? '1' : '0';
    }
  }, []);

  const closeMobile = React.useCallback(() => openMobile(false), [openMobile]);

  // Reflete o estado de colapso no <html> (para o CSS que já tens)
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.sbCollapsed = collapsed ? '1' : '0';
    // opcional: mantemos “pinned=1” por omissão (layout com sidebar presente)
    document.documentElement.dataset.sbPinned = '1';
  }, [collapsed]);

  // No mobile, fecha o drawer ao navegar
  const path = usePathname();
  React.useEffect(() => {
    if (isMobile) closeMobile();
  }, [path, isMobile, closeMobile]);

  // Se estiveres em mobile, considera a sidebar “colapsada” visualmente
  React.useEffect(() => {
    if (isMobile) {
      document.documentElement.dataset.sbCollapsed = '1';
    } else {
      document.documentElement.dataset.sbCollapsed = collapsed ? '1' : '0';
    }
  }, [isMobile, collapsed]);

  const value: SidebarCtx = {
    collapsed,
    setCollapsed,
    toggleCollapse,

    isMobile,
    mobileOpen,
    openMobile,
    closeMobile,

    // aliases de compat
    toggle: toggleCollapse,
    railWidth,
    panelWidth,
    peek,
    setPeek,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarCtx {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}
