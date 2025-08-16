"use client";

import React from "react";

type Ctx = {
  collapsed: boolean;
  toggleCollapsed: () => void;

  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;

  isMobile: boolean;
};

const SidebarContext = React.createContext<Ctx>({
  collapsed: false,
  toggleCollapsed: () => {},

  mobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},

  isMobile: false,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // atualiza flag mobile on resize
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggleCollapsed = React.useCallback(() => setCollapsed((v) => !v), []);
  const openMobile = React.useCallback(() => setMobileOpen(true), []);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  const value: Ctx = {
    collapsed,
    toggleCollapsed,
    mobileOpen,
    openMobile,
    closeMobile,
    isMobile,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export const useSidebar = () => React.useContext(SidebarContext);
