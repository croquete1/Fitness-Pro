// src/components/layout/SidebarProvider.tsx
'use client';

import React from 'react';

export type SidebarContextValue = {
  collapsed: boolean;
  pinned: boolean;
  toggleCollapsed: () => void;
  togglePinned: () => void;
  setCollapsed: (v: boolean) => void;
  setPinned: (v: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function readBoolLS(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {}
  return fallback;
}

function writeBoolLS(key: string, v: boolean) {
  try {
    localStorage.setItem(key, v ? '1' : '0');
  } catch {}
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // defaults seguros para SSR (ajustados no efeito)
  const [collapsed, setCollapsed] = React.useState(false);
  const [pinned, setPinned] = React.useState(true);

  // hidratar de localStorage uma vez
  React.useEffect(() => {
    const nextCollapsed = readBoolLS('fp.sb.collapsed', false);
    const nextPinned = readBoolLS('fp.sb.pinned', true);
    setCollapsed(nextCollapsed);
    setPinned(nextPinned);
  }, []);

  // refletir atributos no <html> (CSS já preparado em globals.css)
  React.useEffect(() => {
    const html = document.documentElement;
    if (collapsed) html.setAttribute('data-sb-collapsed', '1');
    else html.removeAttribute('data-sb-collapsed');
    writeBoolLS('fp.sb.collapsed', collapsed);
  }, [collapsed]);

  React.useEffect(() => {
    const html = document.documentElement;
    if (pinned) html.setAttribute('data-sb-pinned', '1');
    else html.removeAttribute('data-sb-pinned');
    writeBoolLS('fp.sb.pinned', pinned);
  }, [pinned]);

  const toggleCollapsed = React.useCallback(() => setCollapsed((v) => !v), []);
  const togglePinned = React.useCallback(() => setPinned((v) => !v), []);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}

// compat: alguns ficheiros importavam default
export default SidebarProvider;
