'use client';
import React, { createContext, useContext, useMemo, useState } from 'react';

type SidebarState = {
  collapsed: boolean;
  pinned: boolean;
  overlayOpen: boolean;
  setCollapsed: (v: boolean) => void;
  setPinned: (v: boolean) => void;
  setOverlayOpen: (v: boolean) => void;
};

const SidebarCtx = createContext<SidebarState | null>(null);

/**
 * Hook seguro em SSR/pré-render: se o provider ainda não existir,
 * devolve valores “no-op” para não rebentar a build.
 */
export function useSidebarState(): SidebarState {
  const ctx = useContext(SidebarCtx);
  if (!ctx) {
    return {
      collapsed: false,
      pinned: false,
      overlayOpen: false,
      setCollapsed: () => {},
      setPinned: () => {},
      setOverlayOpen: () => {},
    };
  }
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const value = useMemo(
    () => ({ collapsed, setCollapsed, pinned, setPinned, overlayOpen, setOverlayOpen }),
    [collapsed, pinned, overlayOpen]
  );

  return (
    <SidebarCtx.Provider value={value}>
      {children}
    </SidebarCtx.Provider>
  );
}
