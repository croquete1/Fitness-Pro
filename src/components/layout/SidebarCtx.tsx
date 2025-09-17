'use client';

import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';

type SidebarState = {
  collapsed: boolean;
  mobileOpen: boolean;
  theme: 'light' | 'dark';
  toggleCollapse(): void;
  openMobile(): void;
  closeMobile(): void;
  toggleTheme(): void;
};

const Ctx = createContext<SidebarState | null>(null);

export function SidebarProvider({children}: {children: React.ReactNode}) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (localStorage.getItem('sbCollapsed') ?? '0') === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    // collapse
    if (collapsed) html.setAttribute('data-sb-collapsed', '1');
    else html.removeAttribute('data-sb-collapsed');
    localStorage.setItem('sbCollapsed', collapsed ? '1' : '0');

    // mobile
    if (mobileOpen) html.setAttribute('data-sb-mobile-open', '1');
    else html.removeAttribute('data-sb-mobile-open');

    // theme
    if (theme === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
    localStorage.setItem('theme', theme);
  }, [collapsed, mobileOpen, theme]);

  const value = useMemo<SidebarState>(() => ({
    collapsed,
    mobileOpen,
    theme,
    toggleCollapse: () => setCollapsed(v => !v),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
  }), [collapsed, mobileOpen, theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}
