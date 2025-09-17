'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Ctx = {
  collapsed: boolean;
  mobileOpen: boolean;
  theme: 'light' | 'dark';
  toggleCollapse: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleTheme: () => void;
};

const SidebarContext = createContext<Ctx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (localStorage.getItem('sbCollapsed') ?? '0') === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // fallback: prefere media
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    // sidebar
    if (collapsed) html.setAttribute('data-sb-collapsed', '1');
    else html.removeAttribute('data-sb-collapsed');
    if (mobileOpen) html.setAttribute('data-sb-mobile-open', '1');
    else html.removeAttribute('data-sb-mobile-open');
    localStorage.setItem('sbCollapsed', collapsed ? '1' : '0');
  }, [collapsed, mobileOpen]);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = useMemo<Ctx>(() => ({
    collapsed,
    mobileOpen,
    theme,
    toggleCollapse: () => setCollapsed(v => !v),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
  }), [collapsed, mobileOpen, theme]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}
