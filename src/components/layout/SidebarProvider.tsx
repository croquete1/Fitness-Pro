// src/components/layout/SidebarProvider.tsx
'use client';

import * as React from 'react';

type SidebarState = {
  pinned: boolean;
  collapsed: boolean;
  mobileOpen: boolean;
  peek: boolean;
  pin: () => void;
  unpin: () => void;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  setPeek: (v: boolean) => void;
};

const Ctx = React.createContext<SidebarState | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [peek, setPeek] = React.useState(false);

  const value: SidebarState = {
    pinned,
    collapsed,
    mobileOpen,
    peek,
    pin: () => setPinned(true),
    unpin: () => setPinned(false),
    toggleCollapsed: () => setCollapsed((v) => !v),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    setPeek,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}
