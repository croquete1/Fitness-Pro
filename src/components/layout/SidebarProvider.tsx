// src/components/layout/SidebarProvider.tsx
'use client';

import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

type SidebarState = {
  collapsed: boolean;
  peek: boolean;
  setPeek: (v: boolean) => void;
  toggle: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const Ctx = React.createContext<SidebarState | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'), { defaultMatches: true, noSsr: true });

  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('fp:sidebar:collapsed') === '1'; } catch { return false; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('fp:sidebar:collapsed', collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  const [peek, setPeek] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const openMobile = React.useCallback(() => setMobileOpen(true), []);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);
  const toggle = React.useCallback(() => {
    if (!lgUp) { setMobileOpen(v => !v); return; }
    setCollapsed(v => !v);
  }, [lgUp]);

  React.useEffect(() => { if (!lgUp) setPeek(false); }, [lgUp]);

  const value: SidebarState = {
    collapsed: lgUp ? collapsed : false,
    peek, setPeek, toggle,
    mobileOpen, openMobile, closeMobile,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}
