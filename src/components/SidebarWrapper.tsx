"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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
  const [pinned, setPinned] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // carregar do localStorage uma única vez
  useEffect(() => {
    try {
      const p = localStorage.getItem("sb:pinned");
      const c = localStorage.getItem("sb:collapsed");
      if (p !== null) setPinned(p === "1");
      if (c !== null) setCollapsed(c === "1");
    } catch {}
  }, []);

  // persistir alterações
  useEffect(() => {
    try { localStorage.setItem("sb:pinned", pinned ? "1" : "0"); } catch {}
  }, [pinned]);
  useEffect(() => {
    try { localStorage.setItem("sb:collapsed", collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);

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
