// src/components/layout/SidebarProvider.tsx
'use client';

import * as React from 'react';

type SidebarState = {
  pinned: boolean;           // se a sidebar fica sempre aberta no desktop
  collapsed: boolean;        // estado visual colapsado no desktop
  mobileOpen: boolean;       // aberta no mobile (overlay)
  peek: boolean;             // estado temporário ao aproximar o rato
  pin: () => void;
  unpin: () => void;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  setPeek: (v: boolean) => void;
};

const SidebarCtx = React.createContext<SidebarState | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [peek, setPeek] = React.useState(false);

  const value = React.useMemo<SidebarState>(() => ({
    pinned,
    collapsed,
    mobileOpen,
    peek,
    pin: () => setPinned(true),
    unpin: () => setPinned(false),
    toggleCollapsed: () => setCollapsed(v => !v),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    setPeek,
  }), [pinned, collapsed, mobileOpen, peek]);

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarCtx);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}
