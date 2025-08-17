"use client";

import * as React from "react";

type SidebarCtx = {
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  setOverlayOpen: (v: boolean) => void;
};

const SidebarContext = React.createContext<SidebarCtx | null>(null);

const LS_PINNED = "fp:sidenav:pinned";
const LS_COLLAPSED = "fp:sidenav:collapsed";

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "1";
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Defaults estáveis: afixada e expandida
  const [pinned, setPinned] = React.useState<boolean>(() => readBool(LS_PINNED, true));
  const [collapsed, setCollapsed] = React.useState<boolean>(() => readBool(LS_COLLAPSED, false));
  const [overlayOpen, setOverlayOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(LS_PINNED, pinned ? "1" : "0");
      window.localStorage.setItem(LS_COLLAPSED, collapsed ? "1" : "0");
    } catch { /* ignore */ }
  }, [pinned, collapsed]);

  const togglePinned = React.useCallback(() => setPinned((v) => !v), []);
  const toggleCollapsed = React.useCallback(() => setCollapsed((v) => !v), []);

  const openOverlay = React.useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = React.useCallback(() => setOverlayOpen(false), []);

  const value: SidebarCtx = React.useMemo(
    () => ({
      pinned,
      collapsed,
      overlayOpen,
      togglePinned,
      toggleCollapsed,
      openOverlay,
      closeOverlay,
      setPinned,
      setCollapsed,
      setOverlayOpen,
    }),
    [pinned, collapsed, overlayOpen, togglePinned, toggleCollapsed, openOverlay, closeOverlay]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// Hook (named export) — lança erro claro se não montado
export function useSidebarState() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("SidebarCtx not mounted");
  return ctx;
}

// Default export para compatibilidade com imports antigos
export default SidebarProvider;
