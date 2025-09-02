// src/components/layout/SidebarProvider.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Ctx = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const SidebarCtx = createContext<Ctx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(v => !v), []);

  return <SidebarCtx.Provider value={{ isOpen, open, close, toggle }}>{children}</SidebarCtx.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) {
    // evita crash se usado fora do provider
    return { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} } as Ctx;
  }
  return ctx;
}