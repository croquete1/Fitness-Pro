'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SidebarTheme = 'light' | 'dark';

export type SidebarState = {
  collapsed: boolean;
  pinned: boolean;
  mobileOpen: boolean;
  theme: SidebarTheme;

  toggleCollapse: () => void;
  setCollapsed: (v: boolean) => void;
  togglePin: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleTheme: () => void;
};

const SidebarCtx = createContext<SidebarState | null>(null);

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const v = localStorage.getItem(key); return v == null ? fallback : (JSON.parse(v) as T); }
  catch { return fallback; }
}
function writeLS(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => readLS('sb-collapsed', false));
  const [pinned, setPinned] = useState<boolean>(() => readLS('sb-pinned', true));
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<SidebarTheme>(() => readLS('fp-theme', 'light'));

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-sb-pinned', pinned ? '1' : '0');
    if (collapsed) html.setAttribute('data-sb-collapsed', '1'); else html.removeAttribute('data-sb-collapsed');
    if (mobileOpen) html.setAttribute('data-sb-mobile-open', '1'); else html.removeAttribute('data-sb-mobile-open');
    html.setAttribute('data-theme', theme);

    writeLS('sb-collapsed', collapsed);
    writeLS('sb-pinned', pinned);
    writeLS('fp-theme', theme);
  }, [collapsed, pinned, mobileOpen, theme]);

  const value: SidebarState = useMemo(() => ({
    collapsed,
    pinned,
    mobileOpen,
    theme,
    toggleCollapse: () => setCollapsed(v => !v),
    setCollapsed,
    togglePin: () => setPinned(v => !v),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    toggleTheme: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
  }), [collapsed, pinned, mobileOpen, theme]);

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

export function useSidebar(): SidebarState {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}
