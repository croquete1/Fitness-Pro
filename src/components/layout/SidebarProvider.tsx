// src/components/layout/SidebarProvider.tsx
'use client';

import * as React from 'react';
import { useMediaQuery } from '@mui/material';

export type SidebarCtx = {
  // estado base
  collapsed: boolean;
  isMobile: boolean;

  // drawer (mobile)
  mobileOpen: boolean;
  openMobile: (v: boolean) => void;
  closeMobile: () => void;

  // collapse (desktop)
  toggleCollapse: () => void;

  // 👇 hover-peek (rail expandido temporariamente ao pairar)
  peek: boolean;
  setPeek: (v: boolean) => void;
};

const Ctx = React.createContext<SidebarCtx | null>(null);

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width:1023px)');

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // 👇 novo estado para “hover peek”
  const [peek, _setPeek] = React.useState(false);
  const setPeek = (v: boolean) => _setPeek(Boolean(v));

  const openMobile  = (v: boolean) => setMobileOpen(v);
  const closeMobile = () => setMobileOpen(false);
  const toggleCollapse = () => setCollapsed((c) => !c);

  // opcional: refletir em data-attrs do <html> para CSS utilitário (sem obrigatoriedade)
  React.useEffect(() => {
    const html = document.documentElement;
    html.dataset.sbCollapsed = collapsed ? '1' : '0';
    html.dataset.sbMobileOpen = mobileOpen ? '1' : '0';
    // atributo para peek (pode ser usado no teu CSS se quiseres animar largura)
    html.dataset.sbPeek = peek ? '1' : '0';
    return () => {
      delete html.dataset.sbCollapsed;
      delete html.dataset.sbMobileOpen;
      delete html.dataset.sbPeek;
    };
  }, [collapsed, mobileOpen, peek]);

  const value: SidebarCtx = React.useMemo(() => ({
    collapsed, isMobile, mobileOpen, openMobile, closeMobile, toggleCollapse, peek, setPeek,
  }), [collapsed, isMobile, mobileOpen, peek]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar(): SidebarCtx {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useSidebar must be used within <SidebarProvider>');
  return v;
}
