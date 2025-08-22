'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {}
  return fallback;
}

function writeHtmlState(collapsed: boolean, pinned: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
  root.setAttribute('data-sb-pinned', pinned ? '1' : '0');

  // controla a coluna do grid (—sb-col) para o layout
  const styles = getComputedStyle(root);
  const expanded = styles.getPropertyValue('--sb-width').trim();
  const sliced = styles.getPropertyValue('--sb-width-collapsed').trim();
  root.style.setProperty('--sb-col', collapsed ? sliced : expanded);
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // boot (client)
  useEffect(() => {
    const c = readLS('fp:sb:collapsed', false);
    const p = readLS('fp:sb:pinned', true);
    // regra: se colapsada, não pode estar pinned
    const normalizedPinned = p && !c;
    setCollapsed(c);
    setPinned(normalizedPinned);
    writeHtmlState(c, normalizedPinned);
  }, []);

  // reflect 'collapsed'
  useEffect(() => {
    try {
      localStorage.setItem('fp:sb:collapsed', collapsed ? '1' : '0');
    } catch {}
    if (collapsed && pinned) setPinned(false); // colapsar desfixa
    writeHtmlState(collapsed, pinned && !collapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  // reflect 'pinned'
  useEffect(() => {
    try {
      localStorage.setItem('fp:sb:pinned', pinned ? '1' : '0');
    } catch {}
    if (pinned) setCollapsed(false); // afixar força expandida
    writeHtmlState(collapsed, pinned && !collapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const togglePinned = useCallback(() => setPinned(v => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
