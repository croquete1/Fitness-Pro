'use client';
import * as React from 'react';

export type SidebarState = {
  collapsed: boolean;
  peek: boolean;                     // << NOVO
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  setPeek: (v: boolean) => void;     // << NOVO
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const Ctx = React.createContext<SidebarState | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [peek, setPeek] = React.useState(false);   // << NOVO
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // restaurar estado do colapso
  React.useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('fp.sidebar.collapsed') : null;
    if (raw != null) setCollapsed(raw === '1');
  }, []);
  React.useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('fp.sidebar.collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const toggle = React.useCallback(() => setCollapsed((v) => !v), []);
  const openMobile = React.useCallback(() => setMobileOpen(true), []);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  const value = React.useMemo(
    () => ({ collapsed, peek, toggle, setCollapsed, setPeek, mobileOpen, openMobile, closeMobile }),
    [collapsed, peek, mobileOpen, openMobile, closeMobile]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
