"use client";

import React from "react";

type Ctx = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  isMobile: boolean;
  sidebarWidth: number; // px
};

const SidebarContext = React.createContext<Ctx | null>(null);

const W = 272;      // largura fixa (desktop) — não vamos mexer
const W_MIN = 76;   // largura colapsada (desktop)

function useIsMobile() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // persistência do estado colapsado (apenas desktop)
  React.useEffect(() => {
    const raw = localStorage.getItem("fp.sidebar.collapsed");
    if (raw != null) setCollapsed(raw === "1");
  }, []);
  React.useEffect(() => {
    localStorage.setItem("fp.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // se passar para mobile, fecha drawer
  React.useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  const ctx: Ctx = {
    collapsed,
    mobileOpen,
    toggleCollapsed: () => setCollapsed((v) => !v),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    isMobile,
    sidebarWidth: isMobile ? 0 : collapsed ? W_MIN : W,
  };

  return <SidebarContext.Provider value={ctx}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const v = React.useContext(SidebarContext);
  if (!v) throw new Error("useSidebar must be used within SidebarProvider");
  return v;
}
