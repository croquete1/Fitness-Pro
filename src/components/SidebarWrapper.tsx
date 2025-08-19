'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type SidebarCtx = {
  collapsed: boolean;
  pinned: boolean;
  overlayOpen: boolean;

  setCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;

  setPinned: (v: boolean) => void;
  togglePinned: () => void;

  setOverlayOpen: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

function getLS(key: string) {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}
function setLS(key: string, value: string) {
  try {
    if (typeof window !== 'undefined') localStorage.setItem(key, value);
  } catch {}
}

const LS_COLLAPSED = 'fp:sb:collapsed';
const LS_PINNED = 'fp:sb:pinned';

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  // collapsed: por defeito expandida (false)
  const [collapsed, setCollapsed] = useState<boolean>(() => getLS(LS_COLLAPSED) === '1');

  // pinned: por defeito "fixada" (true)
  const [pinned, setPinned] = useState<boolean>(() => {
    const v = getLS(LS_PINNED);
    return v ? v === '1' : true;
  });

  // overlay para mobile (se estiveres a usar)
  const [overlayOpen, setOverlayOpen] = useState(false);

  // refletir "collapsed" no <html data-sb-collapsed> para evitar saltos de layout
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
    }
    setLS(LS_COLLAPSED, collapsed ? '1' : '0');
  }, [collapsed]);

  // guardar pinned
  useEffect(() => {
    setLS(LS_PINNED, pinned ? '1' : '0');
  }, [pinned]);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const togglePinned = useCallback(() => setPinned((v) => !v), []);

  // valor estabilizado – incluir TODAS as dependências (corrige o erro do ESLint)
  const value = useMemo(
    () => ({
      collapsed,
      pinned,
      overlayOpen,
      setCollapsed,
      toggleCollapsed,
      setPinned,
      togglePinned,
      setOverlayOpen,
    }),
    [collapsed, pinned, overlayOpen, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebarState(): SidebarCtx {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebarState must be used within <SidebarProvider>');
  }
  return ctx;
}
