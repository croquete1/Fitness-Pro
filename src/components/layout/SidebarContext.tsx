// src/components/layout/SidebarContext.tsx
'use client';

import React from 'react';

export type SidebarCtx = {
  pinned: boolean;
  collapsed: boolean;
  isMobile: boolean;
  open: boolean;                  // overlay aberto (mobile ou unpinned)

  // actions
  togglePin: () => void;
  toggleCollapse: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // compat / util
  toggle: () => void;             // alias para toggleSidebar (compatibilidade)
  setOpen: (v: boolean) => void;  // usado pela Sidebar (fechar em mobile)
};

const SidebarCtx = React.createContext<SidebarCtx | null>(null);

const LS_PIN = 'fp.sidebar.pinned';
const LS_COL = 'fp.sidebar.collapsed';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Lazy init para evitar flash na hidratação
  const [pinned, setPinned] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const p = window.localStorage.getItem(LS_PIN);
      return p === null ? true : p === '1';
    } catch {
      return true;
    }
  });

  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const c = window.localStorage.getItem(LS_COL);
      return c === '1';
    } catch {
      return false;
    }
  });

  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 1024px)').matches;
  });

  const [open, _setOpen] = React.useState<boolean>(false);

  // Sync a flag de mobile com matchMedia
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Ao entrar em mobile, fecha overlay por padrão
  React.useEffect(() => {
    if (isMobile) _setOpen(false);
  }, [isMobile]);

  const setOpen = React.useCallback((v: boolean) => {
    _setOpen(v);
  }, []);

  const togglePin = React.useCallback(() => {
    setPinned((v) => {
      const nv = !v;
      try {
        window.localStorage.setItem(LS_PIN, nv ? '1' : '0');
      } catch {}
      // Se desafixar, fecha overlay por padrão
      if (!nv) _setOpen(false);
      return nv;
    });
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((v) => {
      const nv = !v;
      try {
        window.localStorage.setItem(LS_COL, nv ? '1' : '0');
      } catch {}
      return nv;
    });
  }, []);

  const openSidebar = React.useCallback(() => _setOpen(true), []);
  const closeSidebar = React.useCallback(() => _setOpen(false), []);
  const toggleSidebar = React.useCallback(() => _setOpen((v) => !v), []);

  // Alias "toggle" para compatibilidade (ex.: MobileTopBar espera "toggle")
  const toggle = toggleSidebar;

  const value = React.useMemo<SidebarCtx>(
    () => ({
      pinned,
      collapsed,
      isMobile,
      open,
      togglePin,
      toggleCollapse,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      toggle, // alias
      setOpen,
    }),
    [
      pinned,
      collapsed,
      isMobile,
      open,
      togglePin,
      toggleCollapse,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      toggle,
      setOpen,
    ]
  );

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

export function useSidebar(): SidebarCtx {
  const ctx = React.useContext(SidebarCtx);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}

export default SidebarProvider;
