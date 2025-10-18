// src/components/layout/SidebarProvider.tsx
'use client';

import * as React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export type SidebarCtx = {
  collapsed: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  openMobile: (v: boolean) => void;
  closeMobile: () => void;
  toggleCollapse: () => void;
  peek: boolean;
  setPeek: (v: boolean) => void;
};

const Ctx = React.createContext<SidebarCtx | null>(null);

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 1023px)', { defaultValue: false, ssrValue: false });

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [peek, _setPeek] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('fp:sidebar-collapsed');
    if (stored === '1') {
      setCollapsed(true);
    }
  }, []);

  const setPeek = React.useCallback((value: boolean) => {
    _setPeek(Boolean(value));
  }, []);

  const openMobile = React.useCallback((value: boolean) => {
    setMobileOpen(Boolean(value));
  }, []);

  const closeMobile = React.useCallback(() => {
    setMobileOpen(false);
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('fp:sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  React.useEffect(() => {
    if (!collapsed || isMobile) {
      _setPeek(false);
    }
  }, [collapsed, isMobile]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.dataset.sbCollapsed = collapsed ? '1' : '0';
    html.dataset.sbMobileOpen = mobileOpen ? '1' : '0';
    html.dataset.sbPeek = peek ? '1' : '0';
    return () => {
      delete html.dataset.sbCollapsed;
      delete html.dataset.sbMobileOpen;
      delete html.dataset.sbPeek;
    };
  }, [collapsed, mobileOpen, peek]);

  const value = React.useMemo<SidebarCtx>(() => ({
    collapsed,
    isMobile,
    mobileOpen,
    openMobile,
    closeMobile,
    toggleCollapse,
    peek,
    setPeek,
  }), [collapsed, isMobile, mobileOpen, openMobile, closeMobile, toggleCollapse, peek, setPeek]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar(): SidebarCtx {
  const value = React.useContext(Ctx);
  if (!value) throw new Error('useSidebar must be used within <SidebarProvider>');
  return value;
}
