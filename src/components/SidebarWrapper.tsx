"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/** ----- Contexto da Sidebar (pin / collapse) ----- */
type SidebarContextValue = {
  pinned: boolean;
  collapsed: boolean;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  togglePinned: () => void;
  toggleCollapsed: () => void;
};

const SidebarCtx = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Leitura inicial (no browser) e persistência
  useEffect(() => {
    try {
      const raw = localStorage.getItem("fp.sidebar");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.pinned === "boolean") setPinned(parsed.pinned);
        if (typeof parsed.collapsed === "boolean") setCollapsed(parsed.collapsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("fp.sidebar", JSON.stringify({ pinned, collapsed }));
    } catch {}
  }, [pinned, collapsed]);

  // Ajuda CSS (opcional)
  useEffect(() => {
    document.documentElement.style.setProperty("--fp-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      pinned,
      collapsed,
      setPinned,
      setCollapsed,
      togglePinned: () => setPinned((v) => !v),
      toggleCollapsed: () => setCollapsed((v) => !v),
    }),
    [pinned, collapsed]
  );

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

export function useSidebarState() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("SidebarCtx not mounted");
  return ctx;
}

/** export default para compatibilidade com imports existentes */
export default useSidebarState;
