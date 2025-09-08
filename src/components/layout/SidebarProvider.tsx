'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

type SidebarCtx = {
  pinned: boolean;
  collapsed: boolean;
  togglePinned: () => void;
  toggleCollapsed: () => void;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

const KEY_PINNED = 'fp.sidebar.pinned';
const KEY_COLLAPSED = 'fp.sidebar.collapsed';

function readBool(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === '1';
  } catch {
    return fallback;
  }
}

function syncDom(pinned: boolean, collapsed: boolean) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.dataset.sbPinned = pinned ? '1' : '0';
  html.dataset.sbCollapsed = collapsed ? '1' : '0';
}

export const SidebarProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // defaults: afixada e expandida
  const [pinned, setPinned] = useState<boolean>(() => readBool(KEY_PINNED, true));
  const [collapsed, setCollapsed] = useState<boolean>(() => readBool(KEY_COLLAPSED, false));

  // sincronizar DOM + storage
  useEffect(() => {
    syncDom(pinned, collapsed);
    try {
      localStorage.setItem(KEY_PINNED, pinned ? '1' : '0');
      localStorage.setItem(KEY_COLLAPSED, collapsed ? '1' : '0');
    } catch {}
  }, [pinned, collapsed]);

  // sync entre tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY_PINNED && e.newValue != null) setPinned(e.newValue === '1');
      if (e.key === KEY_COLLAPSED && e.newValue != null) setCollapsed(e.newValue === '1');
    };
    window.addEventListener('storage', onStorage);
    // garantir DOM atualizado no mount
    syncDom(pinned, collapsed);
    return () => window.removeEventListener('storage', onStorage);
  }, []); // mount only

  const togglePinned = useCallback(() => setPinned((v) => !v), []);
  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);

  const value = useMemo<SidebarCtx>(
    () => ({ pinned, collapsed, togglePinned, toggleCollapsed, setPinned, setCollapsed }),
    [pinned, collapsed, togglePinned, toggleCollapsed]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

// hook
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}

// default export para compatibilidade com imports existentes
export default SidebarProvider;
