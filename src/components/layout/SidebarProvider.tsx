"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type SidebarCtx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;

  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  openMobile: () => void;
  closeMobile: () => void;

  isMobile: boolean;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // detetar mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <Ctx.Provider
      value={{
        collapsed,
        setCollapsed,
        toggle,
        mobileOpen,
        setMobileOpen,
        openMobile,
        closeMobile,
        isMobile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSidebar() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSidebar deve ser usado dentro de <SidebarProvider>");
  return v;
}
