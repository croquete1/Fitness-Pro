'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';

export type SidebarCtx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapse: () => void;

  mobileOpen: boolean;
  openMobile: (v?: boolean) => void;
  closeMobile: () => void;
  toggle: () => void;

  isMobile: boolean;

  /** ➕ larguras pedidas por MainContent */
  railWidth: number;   // quando colapsada
  panelWidth: number;  // expandida
};

const Ctx = React.createContext<SidebarCtx | null>(null);

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width:1024px)');
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  // larguras consistentes com o CSS
  const railWidth = 72;
  const panelWidth = 240;

  // sincroniza data-attrs esperados pelo teu global.css
  React.useEffect(() => {
    const html = document.documentElement;
    html.dataset.sbCollapsed = collapsed ? '1' : '0';
    html.dataset.sbMobileOpen = mobileOpen ? '1' : '0';
    html.dataset.sbPinned = '1';
    return () => {
      delete html.dataset.sbCollapsed;
      delete html.dataset.sbMobileOpen;
      delete html.dataset.sbPinned;
    };
  }, [collapsed, mobileOpen]);

  // fecha drawer ao navegar
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const value: SidebarCtx = {
    collapsed,
    setCollapsed,
    toggleCollapse: () => setCollapsed(v => !v),

    mobileOpen,
    openMobile: (v) => setMobileOpen(v ?? true),
    closeMobile: () => setMobileOpen(false),
    toggle: () => (isMobile ? setMobileOpen(v => !v) : setCollapsed(v => !v)),

    isMobile,
    railWidth,
    panelWidth,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useSidebar deve ser usado dentro de <SidebarProvider>');
  return ctx;
}
