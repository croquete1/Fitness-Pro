// src/components/layout/SidebarProvider.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {}
  return fallback;
}

function getVar(root: HTMLElement, name: string, fallback: string) {
  const v = getComputedStyle(root).getPropertyValue(name).trim();
  return v || fallback;
}

function writeHtmlState(collapsed: boolean, pinned: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // flags para CSS
  root.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
  root.setAttribute('data-sb-pinned', pinned ? '1' : '0');

  // controla a coluna do grid
  const expanded = getVar(root, '--sb-width', '264px');
  const sliced   = getVar(root, '--sb-width-collapsed', '72px');
  root.style.setProperty('--sb-col', collapsed ? sliced : expanded);
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // boot (apenas cliente)
  useEffect(() => {
    const c = readLS('fp:sb:collapsed', false);
    const p = readLS('fp:sb:pinned', true);
    const normalizedPinned = p && !c; // se colapsada, não pode estar afixada
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

  // sincroniza entre separadores (opcional mas útil)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'fp:sb:collapsed' || e.key === 'fp:sb:pinned') {
        const c = readLS('fp:sb:collapsed', false);
        const p = readLS('fp:sb:pinned', true) && !c;
        setCollapsed(c);
        setPinned(p);
        writeHtmlState(c, p);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const togglePinned = useCallback(() => setPinned(v => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
