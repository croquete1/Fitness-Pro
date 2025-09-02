// src/components/layout/SidebarProvider.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type SidebarCtx = {
  // abertura “temporária” (ex.: mobile drawer)
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;

  // estado “colapsado” (mini sidebar)
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;

  // estado “fixo/pinado” (sidebar sempre aberta em desktop)
  pinned: boolean;
  setPinned: (v: boolean) => void;
  togglePinned: () => void;
};

const SidebarContext = createContext<SidebarCtx | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);

  // hidratar de localStorage (só no cliente)
  useEffect(() => {
    try {
      const c = localStorage.getItem('sidebar:collapsed');
      if (c !== null) setCollapsed(c === '1' || c === 'true');
      const p = localStorage.getItem('sidebar:pinned');
      if (p !== null) setPinned(p === '1' || p === 'true');
    } catch {}
  }, []);

  const toggle = useCallback(() => setOpen(v => !v), []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar:collapsed', next ? '1' : '0');
      } catch {}
      return next;
    });
  }, []);

  const togglePinned = useCallback(() => {
    setPinned(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar:pinned', next ? '1' : '0');
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo<SidebarCtx>(
    () => ({
      open,
      setOpen,
      toggle,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      pinned,
      setPinned,
      togglePinned,
    }),
    [open, collapsed, pinned, toggle, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}

// default export para suportar `import SidebarProvider from './SidebarProvider'`
export default SidebarProvider;