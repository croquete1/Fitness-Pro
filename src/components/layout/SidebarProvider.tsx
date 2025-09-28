'use client';

import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

export type SidebarCtx = {
  // estado/layout
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapse: () => void;

  // mobile
  isMobile: boolean;
  mobileOpen: boolean;
  openMobile: (open?: boolean) => void;
  closeMobile: () => void;

  // hover-peek (rail expand temporário)
  peek: boolean;
  setPeek: (v: boolean) => void;

  // larguras (px)
  widthCollapsed: number; // rail
  widthExpanded: number;  // painel
};

const Ctx = React.createContext<SidebarCtx | null>(null);

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width:1024px)');
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);
  const [peek, setPeek] = React.useState<boolean>(false);

  // larguras alinhadas ao teu design
  const widthCollapsed = 72;
  const widthExpanded = 240;

  // data-attrs que o teu CSS usa
  React.useEffect(() => {
    document.documentElement.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-sb-mobile-open', mobileOpen ? '1' : '0');
  }, [mobileOpen]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-sb-peek', peek ? '1' : '0');
  }, [peek]);

  // fecha drawer ao sair de mobile
  React.useEffect(() => {
    if (!isMobile && mobileOpen) setMobileOpen(false);
  }, [isMobile, mobileOpen]);

  const toggleCollapse = () => setCollapsed((c) => !c);
  const openMobile = (open: boolean = true) => setMobileOpen(open);
  const closeMobile = () => setMobileOpen(false);

  const value: SidebarCtx = {
    collapsed,
    setCollapsed,
    toggleCollapse,
    isMobile,
    mobileOpen,
    openMobile,
    closeMobile,
    peek,
    setPeek,
    widthCollapsed,
    widthExpanded,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar(): SidebarCtx {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}
