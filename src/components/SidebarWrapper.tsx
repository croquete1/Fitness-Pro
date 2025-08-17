"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type Ctx = {
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  setOverlayOpen: (v: boolean) => void;
};

const SidebarCtx = createContext<Ctx | null>(null);

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  // valores por defeito iguais ao comportamento que tinhas
  const [pinned, setPinned] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const value = useMemo(
    () => ({ pinned, collapsed, overlayOpen, setPinned, setCollapsed, setOverlayOpen }),
    [pinned, collapsed, overlayOpen]
  );

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

export function useSidebarState() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("SidebarCtx not mounted");
  return ctx;
}
