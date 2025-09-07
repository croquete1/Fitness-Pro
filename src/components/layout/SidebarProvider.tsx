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

type SidebarState = {
  open: boolean;
  compact: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  setCompact: (v: boolean) => void;
  toggleCompact: () => void;
};

const SidebarContext = createContext<SidebarState | null>(null);
const STORAGE_KEY = 'fp.sidebar';

function readInitial() {
  // SSR-safe
  if (typeof window === 'undefined') return { open: true, compact: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { open: boolean; compact: boolean };
  } catch {}
  // Em ecrãs estreitos começa fechado
  const narrow =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(max-width: 1024px)').matches;
  return { open: !narrow, compact: false };
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(() => readInitial().open);
  const [compact, setCompact] = useState<boolean>(() => readInitial().compact);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ open, compact }));
    } catch {}
  }, [open, compact]);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const toggleCompact = useCallback(() => setCompact((v) => !v), []);

  const value = useMemo(
    () => ({ open, compact, setOpen, toggle, setCompact, toggleCompact }),
    [open, compact, toggle, toggleCompact]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}

// Default export para compatibilidade com imports antigos:
// import SidebarProvider from '@/components/layout/SidebarProvider'
export default SidebarProvider;
