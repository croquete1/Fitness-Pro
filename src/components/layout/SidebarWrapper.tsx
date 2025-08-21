"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Ctx = {
  collapsed: boolean;
  pinned: boolean;
  toggleCollapsed: () => void;
  togglePinned: () => void;
  setCollapsed: (v: boolean) => void;
  setPinned: (v: boolean) => void;
};

const SidebarContext = createContext<Ctx | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

function readLS(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {}
  return fallback;
}

function applyDomState(collapsed: boolean, pinned: boolean) {
  const root = document.documentElement;
  root.setAttribute("data-sb-collapsed", collapsed ? "1" : "0");
  root.setAttribute("data-sb-pinned", pinned ? "1" : "0");
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // boot
  useEffect(() => {
    const c = readLS("fp:sb:collapsed", false);
    const p = readLS("fp:sb:pinned", true);
    const effectivePinned = p && !c;    // não pode estar pinned e colapsada
    setCollapsed(c);
    setPinned(effectivePinned);
    applyDomState(c, effectivePinned);
  }, []);

  // reflect collapsed
  useEffect(() => {
    if (typeof document === "undefined") return;
    try { localStorage.setItem("fp:sb:collapsed", collapsed ? "1" : "0"); } catch {}
    if (collapsed && pinned) setPinned(false); // colapsar desfixa
    applyDomState(collapsed, collapsed ? false : pinned);
  }, [collapsed, pinned]);

  // reflect pinned (⚠️ usar o collapsed actual; só força expandido quando pinned=true)
  useEffect(() => {
    if (typeof document === "undefined") return;
    try { localStorage.setItem("fp:sb:pinned", pinned ? "1" : "0"); } catch {}
    if (pinned && collapsed) setCollapsed(false);
    applyDomState(pinned ? false : collapsed, pinned);
  }, [pinned, collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const togglePinned = useCallback(() => setPinned(v => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
