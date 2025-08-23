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

function readLSBool(key: string, fallback: boolean) {
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

  // --sb-col SEMPRE baseado em collapsed
  const cs = getComputedStyle(root);
  const w  = (cs.getPropertyValue('--sb-width') || '').trim() || '264px';
  const wc = (cs.getPropertyValue('--sb-width-collapsed') || '').trim() || '72px';
  root.style.setProperty('--sb-col', collapsed ? wc : w);
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // boot no cliente
  useEffect(() => {
    const c = readLSBool('fp:sb:collapsed', false);
    const p = readLSBool('fp:sb:pinned', true);
    setCollapsed(c);
    setPinned(p);
    writeHtmlState(c, p);
  }, []);

  // refletir 'collapsed'
  useEffect(() => {
    try { localStorage.setItem('fp:sb:collapsed', collapsed ? '1' : '0'); } catch {}
    writeHtmlState(collapsed, pinned);
  }, [collapsed, pinned]); // depende dos dois para atualizar atributos de uma vez

  // refletir 'pinned'
  useEffect(() => {
    try { localStorage.setItem('fp:sb:pinned', pinned ? '1' : '0'); } catch {}
    writeHtmlState(collapsed, pinned);
  }, [collapsed, pinned]);

  // sync entre separadores
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'fp:sb:collapsed' || e.key === 'fp:sb:pinned') {
        const c = readLSBool('fp:sb:collapsed', false);
        const p = readLSBool('fp:sb:pinned', true);
        setCollapsed(c);
        setPinned(p);
        writeHtmlState(c, p);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const togglePinned    = useCallback(() => setPinned(v => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
