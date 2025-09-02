'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SidebarCtx = {
  /** Mobile drawer aberto/fechado */
  open: boolean;
  setOpen: (v: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;

  /** Estado de colapso (desktop) */
  collapsed: boolean;
  toggleCollapsed: () => void;

  /** Estado “fixo” (desktop): sidebar fica sempre visível */
  pinned: boolean;
  togglePinned: () => void;
};

const SidebarContext = createContext<SidebarCtx | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);

  // Persistência leve no browser
  useEffect(() => {
    try {
      const c = localStorage.getItem('sb_collapsed');
      const p = localStorage.getItem('sb_pinned');
      if (c) setCollapsed(c === '1');
      if (p) setPinned(p === '1');
    } catch {}
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((v) => {
      try { localStorage.setItem('sb_collapsed', v ? '0' : '1'); } catch {}
      return !v;
    });

  const togglePinned = () =>
    setPinned((v) => {
      try { localStorage.setItem('sb_pinned', v ? '0' : '1'); } catch {}
      return !v;
    });

  const value = useMemo<SidebarCtx>(
    () => ({
      open,
      setOpen,
      openSidebar: () => setOpen(true),
      closeSidebar: () => setOpen(false),
      collapsed,
      toggleCollapsed,
      pinned,
      togglePinned,
    }),
    [open, collapsed, pinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}

// Para compatibilidade com imports existentes
export default SidebarProvider;