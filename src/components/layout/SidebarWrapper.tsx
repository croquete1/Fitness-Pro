// src/components/layout/SidebarWrapper.tsx
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

  // update the CSS variable that the grid reads
  const get = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
  const width = collapsed ? get("--sb-width-collapsed") : get("--sb-width");
  root.style.setProperty("--sb-col", width);
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // boot from localStorage on client
  useEffect(() => {
    const c = readLS("fp:sb:collapsed", false);
    const p = readLS("fp:sb:pinned", true);
    setCollapsed(c);
    setPinned(p && !c);
    applyDomState(c, p && !c);
  }, []);

  // reflect 'collapsed'
  useEffect(() => {
    if (typeof document === "undefined") return;
    try {
      localStorage.setItem("fp:sb:collapsed", collapsed ? "1" : "0");
    } catch {}
    if (collapsed && pinned) setPinned(false); // collapsing unpins
    applyDomState(collapsed, collapsed ? false : pinned);
  }, [collapsed]);

  // reflect 'pinned'
  useEffect(() => {
    if (typeof document === "undefined") return;
    try {
      localStorage.setItem("fp:sb:pinned", pinned ? "1" : "0");
    } catch {}
    if (pinned) setCollapsed(false); // pin forces expanded
    applyDomState(false, pinned);
  }, [pinned]);

  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const togglePinned = useCallback(() => setPinned(v => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
