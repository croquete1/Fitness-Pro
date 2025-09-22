'use client';

import * as React from 'react';

type Ctx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;

  /** “espreitar” enquanto o rato está por cima quando está colapsada */
  peek: boolean;
  setPeek: (v: boolean) => void;

  /** mobile drawer */
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
};

const SidebarContext = React.createContext<Ctx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = React.useState(false);
  const [peek, setPeek] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Persistência do estado “collapsed”
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('fp:sidebar:collapsed');
      if (saved != null) setCollapsedState(saved === '1');
    } catch {}
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem('fp:sidebar:collapsed', collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  // Fechar drawer ao mudar de tamanho de ecrã
  React.useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setMobileOpen(false);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  const setCollapsed = (v: boolean) => setCollapsedState(v);
  const toggle = () => setCollapsedState((v) => !v);
  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((v) => !v);

  const value: Ctx = {
    collapsed,
    setCollapsed,
    toggle,
    peek,
    setPeek,
    mobileOpen,
    openMobile,
    closeMobile,
    toggleMobile,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}
