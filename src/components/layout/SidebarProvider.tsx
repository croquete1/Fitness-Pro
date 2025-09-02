// src/components/layout/SidebarProvider.tsx
'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type SidebarCtx = {
  open: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(v => !v), []);
  return (
    <SidebarContext.Provider value={{ open, toggle, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}

// 👇 adiciona export default para suportar imports existentes:
//   import SidebarProvider from './SidebarProvider'
export default SidebarProvider;