'use client';

import * as React from 'react';

type Ctx = {
  pinned: boolean;
  collapsed: boolean;
  isMobile: boolean;
  open: boolean;
  togglePin(): void;
  toggleCollapse(): void;
  openMobile(): void;
  closeMobile(): void;
  /** Alias de conveniência: em mobile abre/fecha; em desktop alterna colapso */
  toggle(): void;
};

const SidebarContext = React.createContext<Ctx | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const togglePin = () => setPinned((v) => !v);
  const toggleCollapse = () => setCollapsed((v) => !v);
  const openMobile = () => setOpen(true);
  const closeMobile = () => setOpen(false);

  const toggle = () => {
    if (isMobile) setOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  const value = React.useMemo(
    () => ({ pinned, collapsed, isMobile, open, togglePin, toggleCollapse, openMobile, closeMobile, toggle }),
    [pinned, collapsed, isMobile, open]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
