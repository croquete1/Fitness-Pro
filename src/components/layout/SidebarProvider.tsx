// src/components/layout/SidebarProvider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

type SidebarCtx = {
  pinned: boolean;
  collapsed: boolean;
  togglePinned: () => void;
  toggleCollapsed: () => void;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

const KEY_PINNED = 'fp.sidebar.pinned';
const KEY_COLLAPSED = 'fp.sidebar.collapsed';

function readBool(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === '1';
  } catch {
    return fallback;
  }
}

function syncDom(pinned: boolean, collapsed: boolean) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.dataset.sbPinned = pinned ? '1' : '0';
  html.dataset.sbCollapsed = collapsed ? '1' : '0';
}

export const SidebarProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // defaults: afixada e expandida
  const [pinned, setPinned] = useState<boolean>(() => readBool(KEY_PINNED, true));
  // guardamos o "raw" para poder derivar o collapsed final consoante pinned
  const [collapsedRaw, setCollapsedRaw] = useState<boolean>(() =>
    readBool(KEY_COLLAPSED, false),
  );

  // regra: se NÃO está afixada, fica sempre colapsada (rail)
  const collapsed = pinned ? collapsedRaw : true;

  // garantir coerência quando se desfixa (força colapso)
  useEffect(() => {
    if (!pinned && collapsedRaw === false) setCollapsedRaw(true);
  }, [pinned, collapsedRaw]);

  // sincronizar DOM + storage (corrige warnings de deps)
  useEffect(() => {
    syncDom(pinned, collapsed);
    try {
      localStorage.setItem(KEY_PINNED, pinned ? '1' : '0');
      localStorage.setItem(KEY_COLLAPSED, collapsed ? '1' : '0');
    } catch {}
  }, [pinned, collapsed]);

  // sync entre tabs (sem referências a pinned/collapsed para evitar warnings)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY_PINNED && e.newValue != null) setPinned(e.newValue === '1');
      if (e.key === KEY_COLLAPSED && e.newValue != null) setCollapsedRaw(e.newValue === '1');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const togglePinned = useCallback(() => setPinned((v) => !v), []);

  const toggleCollapsed = useCallback(() => {
    // Se não estiver afixada, ao "compactar" tornamos afixada + expandida (UX melhor).
    if (!pinned) {
      setPinned(true);
      setCollapsedRaw(false);
      return;
    }
    setCollapsedRaw((v) => !v);
  }, [pinned]);

  const value = useMemo<SidebarCtx>(
    () => ({
      pinned,
      collapsed,
      togglePinned,
      toggleCollapsed,
      setPinned,
      // expõe setter com o raw internamente
      setCollapsed: setCollapsedRaw,
    }),
    [pinned, collapsed, togglePinned, toggleCollapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

// hook
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}

// default export para compatibilidade com imports existentes
export default SidebarProvider;
