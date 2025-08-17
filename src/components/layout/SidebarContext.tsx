"use client";

import React from "react";

type Ctx = {
  pinned: boolean;
  collapsed: boolean;
  isMobile: boolean;
  open: boolean; // overlay aberto (mobile ou unpinned)
  togglePin: () => void;
  toggleCollapse: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const SidebarCtx = React.createContext<Ctx | null>(null);

const LS_PIN = "fp.sidebar.pinned";
const LS_COL = "fp.sidebar.collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = React.useState<boolean>(true);
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);

  // hidratação segura
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);

    // persistência
    try {
      const p = localStorage.getItem(LS_PIN);
      const c = localStorage.getItem(LS_COL);
      if (p !== null) setPinned(p === "1");
      if (c !== null) setCollapsed(c === "1");
    } catch {}

    return () => mq.removeEventListener("change", update);
  }, []);

  // quando entra em mobile, vira overlay e fecha
  React.useEffect(() => {
    if (isMobile) setOpen(false);
  }, [isMobile]);

  const togglePin = React.useCallback(() => {
    setPinned((v) => {
      const nv = !v;
      try { localStorage.setItem(LS_PIN, nv ? "1" : "0"); } catch {}
      // se desafixar, fecha overlay por padrão
      if (!nv) setOpen(false);
      return nv;
    });
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((v) => {
      const nv = !v;
      try { localStorage.setItem(LS_COL, nv ? "1" : "0"); } catch {}
      return nv;
    });
  }, []);

  const openSidebar  = React.useCallback(() => setOpen(true), []);
  const closeSidebar = React.useCallback(() => setOpen(false), []);
  const toggleSidebar = React.useCallback(() => setOpen((v) => !v), []);

  const value: Ctx = {
    pinned, collapsed, isMobile, open,
    togglePin, toggleCollapse,
    openSidebar, closeSidebar, toggleSidebar,
  };

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

export function useSidebar() {
  const ctx = React.useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

export default SidebarProvider;
