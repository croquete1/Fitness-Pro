"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type SidebarCtx = {
  collapsed: boolean;
  pinned: boolean;
  setCollapsed: (v: boolean) => void;
  setPinned: (v: boolean) => void;
  toggleCollapsed: () => void;
  togglePinned: () => void;
};

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  pinned: true,
  setCollapsed: () => {},
  setPinned: () => {},
  toggleCollapsed: () => {},
  togglePinned: () => {},
});

const LS_COLLAPSED = "fp.sidebar.collapsed";
const LS_PINNED = "fp.sidebar.pinned";

function bootFromStorage() {
  if (typeof window === "undefined") return { collapsed: false, pinned: true };
  const c = localStorage.getItem(LS_COLLAPSED);
  const p = localStorage.getItem(LS_PINNED);
  return {
    collapsed: c ? c === "1" : false,
    pinned: p ? p === "1" : true,
  };
}

function applyHtmlAttrs({ collapsed }: { collapsed: boolean }) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-sb-collapsed", collapsed ? "1" : "0");
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const boot = bootFromStorage();
  const [collapsed, setCollapsed] = useState<boolean>(boot.collapsed);
  const [pinned, setPinned] = useState<boolean>(boot.pinned);

  // Persistência + atributo no <html> para layout instantâneo
  useEffect(() => {
    applyHtmlAttrs({ collapsed });
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_COLLAPSED, collapsed ? "1" : "0");
    }
  }, [collapsed]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_PINNED, pinned ? "1" : "0");
    }
  }, [pinned]);

  const value = useMemo<SidebarCtx>(
    () => ({
      collapsed,
      pinned,
      setCollapsed,
      setPinned,
      toggleCollapsed: () => setCollapsed((v) => !v),
      togglePinned: () => setPinned((v) => !v),
    }),
    [collapsed, pinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export const useSidebarState = () => useContext(SidebarContext);
