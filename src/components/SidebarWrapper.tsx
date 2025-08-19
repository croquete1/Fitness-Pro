"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type SidebarCtx = {
  collapsed: boolean;
  pinned: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;
  togglePinned: () => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const v = window.localStorage.getItem(key);
  return v === null ? fallback : v === "1";
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  // arrancar com a preferência do utilizador, sem “salto”
  const [collapsed, setCollapsed] = useState<boolean>(() => readBool("fp:sb:collapsed", false));
  const [pinned, setPinned]       = useState<boolean>(() => readBool("fp:sb:pinned", true));

  // refletir no <html> para o CSS (e persistir)
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-sb-collapsed", collapsed ? "1" : "0");
    window.localStorage.setItem("fp:sb:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    window.localStorage.setItem("fp:sb:pinned", pinned ? "1" : "0");
  }, [pinned]);

  const value = useMemo<SidebarCtx>(() => ({
    collapsed,
    pinned,
    toggleCollapsed: () => setCollapsed(v => !v),
    setCollapsed,
    togglePinned: () => setPinned(v => !v),
  }), [collapsed, pinned]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebarState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebarState must be used inside <SidebarProvider>");
  return ctx;
}
