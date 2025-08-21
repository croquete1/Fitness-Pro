'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

type Ctx = {
  collapsed: boolean;
  pinned: boolean;
  toggleCollapsed: () => void;
  togglePinned: () => void;
  setCollapsed: (v: boolean) => void;
  setPinned: (v: boolean) => void;
};

const SidebarContext = createContext<Ctx | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

function readLS(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v === '1' || v === 'true') return true;
    if (v === '0' || v === 'false') return false;
  } catch {}
  return fallback;
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // boot (cliente) — compatível com as chaves antigas
  useEffect(() => {
    const c = readLS('fp:sb:collapsed', readLS('sb-collapsed', false));
    const p = readLS('fp:sb:pinned', true);
    setCollapsed(c);
    setPinned(p && !c);
  }, []);

  // reflect 'collapsed'
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-sb-collapsed', collapsed ? 'true' : 'false');
    try { localStorage.setItem('fp:sb:collapsed', collapsed ? 'true' : 'false'); } catch {}
    if (collapsed && pinned) setPinned(false);
  }, [collapsed, pinned]);

  // reflect 'pinned'
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-sb-pinned', pinned ? 'true' : 'false');
    try { localStorage.setItem('fp:sb:pinned', pinned ? 'true' : 'false'); } catch {}
    if (pinned) setCollapsed(false);
  }, [pinned]);

  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const togglePinned = useCallback(() => setPinned(v => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
