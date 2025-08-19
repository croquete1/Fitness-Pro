"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type SidebarCtx = {
  collapsed: boolean;
  pinned: boolean;
  toggleCollapsed: () => void;
  togglePinned: () => void;
  setCollapsed: (v: boolean) => void;
  setPinned: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

function applyCollapsedToDOM(collapsed: boolean) {
  try {
    document.documentElement.setAttribute("data-sb-collapsed", collapsed ? "1" : "0");
    localStorage.setItem("fp:sb:collapsed", collapsed ? "1" : "0");
  } catch {}
}

function readInitialCollapsed(): boolean {
  try {
    const v = localStorage.getItem("fp:sb:collapsed");
    return v === "1";
  } catch {
    return false;
  }
}

function readInitialPinned(): boolean {
  try {
    const v = localStorage.getItem("fp:sb:pinned");
    return v !== "0"; // default pinned
  } catch {
    return true;
  }
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(readInitialCollapsed());
  const [pinned, setPinnedState] = useState<boolean>(readInitialPinned());

  useEffect(() => { applyCollapsedToDOM(collapsed); }, [collapsed]);

  const setCollapsed = (v: boolean) => setCollapsedState(v);
  const setPinned = (v: boolean) => {
    setPinnedState(v);
    try { localStorage.setItem("fp:sb:pinned", v ? "1" : "0"); } catch {}
  };

  const toggleCollapsed = () => setCollapsedState(c => !c);
  const togglePinned = () => setPinned(!pinned);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSidebarState = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebarState must be used within SidebarProvider");
  return ctx;
};
