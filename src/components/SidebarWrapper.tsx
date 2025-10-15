// src/components/SidebarWrapper.tsx
'use client';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

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

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
    root.setAttribute('data-sb-pinned', pinned ? '1' : '0');

    const cs = getComputedStyle(root);
    const w = cs.getPropertyValue('--sb-width').trim() || '264px';
    const wc = cs.getPropertyValue('--sb-width-collapsed').trim() || '72px';
    const effective = pinned ? (collapsed ? wc : w) : wc;
    root.style.setProperty('--sb-col', effective);
  }, [collapsed, pinned]); // <- inclui pinned

  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const togglePinned = useCallback(() => setPinned(v => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
