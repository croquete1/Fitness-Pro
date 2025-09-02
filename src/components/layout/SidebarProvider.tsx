// src/components/layout/SidebarProvider.tsx
'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type SidebarCtx = {
  open: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(v => !v), []);
  return <Ctx.Provider value={{ open, toggle, setOpen }}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}