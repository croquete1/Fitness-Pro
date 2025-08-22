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

/** Apenas escreve os data-attributes; nada de CSS vars aqui. */
function writeHtmlState(collapsed: boolean, pinned: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
  root.setAttribute('data-sb-pinned', pinned ? '1' : '0');
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // boot (cliente)
  useEffect(() => {
    const c = readLS('fp:sb:collapsed', false);
    const p = readLS('fp:sb:pinned', true);
    const normalizedPinned = p && !c; // se estiver colapsada, não pode estar afixada
    setCollapsed(c);
    setPinned(normalizedPinned);
    writeHtmlState(c, normalizedPinned);
  }, []);

  // reflect 'collapsed' — colapsar desfixa
  useEffect(() => {
    try {
      localStorage.setItem('fp:sb:collapsed', collapsed ? '1' : '0');
    } catch {}
    const nextPinned = pinned && !collapsed;
    if (nextPinned !== pinned) setPinned(nextPinned);
    writeHtmlState(collapsed, nextPinned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  // reflect 'pinned' — afixar força expandida
  useEffect(() => {
    try {
      localStorage.setItem('fp:sb:pinned', pinned ? '1' : '0');
    } catch {}
    const nextCollapsed = pinned ? false : collapsed;
    if (nextCollapsed !== collapsed) setCollapsed(nextCollapsed);
    writeHtmlState(nextCollapsed, pinned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  // sincroniza entre separadores
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
