"use client";

import React from "react";

type Ctx = {
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  setOverlayOpen: (v: boolean) => void;
  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
};

/**
 * Valor seguro por defeito (NÃO lança erro). Isto evita falhas
 * no build/prerender quando algum componente usa o hook fora do provider.
 */
const safeDefault: Ctx = {
  pinned: true,
  collapsed: false,
  overlayOpen: false,
  setPinned: () => {},
  setCollapsed: () => {},
  setOverlayOpen: () => {},
  togglePinned: () => {},
  toggleCollapsed: () => {},
  openOverlay: () => {},
  closeOverlay: () => {},
};

const SidebarContext = React.createContext<Ctx>(safeDefault);

export function useSidebar(): Ctx {
  return React.useContext(SidebarContext);
}

// Alias para compatibilidade com imports antigos (ex.: useSidebarState)
export const useSidebarState = useSidebar;

type ProviderProps = { children: React.ReactNode };

export function SidebarProvider({ children }: ProviderProps) {
  // carregar prefs do utilizador (no 1º render no cliente)
  const [pinned, setPinned] = React.useState<boolean>(true);
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [overlayOpen, setOverlayOpen] = React.useState<boolean>(false);

  // boot no cliente
  React.useEffect(() => {
    try {
      const p = localStorage.getItem("fp:pinned");
      const c = localStorage.getItem("fp:collapsed");
      if (p !== null) setPinned(p === "1");
      if (c !== null) setCollapsed(c === "1");
    } catch {}
  }, []);

  // persistir
  React.useEffect(() => {
    try {
      localStorage.setItem("fp:pinned", pinned ? "1" : "0");
    } catch {}
  }, [pinned]);

  React.useEffect(() => {
    try {
      localStorage.setItem("fp:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  // helpers
  const togglePinned = React.useCallback(() => setPinned((v) => !v), []);
  const toggleCollapsed = React.useCallback(() => setCollapsed((v) => !v), []);
  const openOverlay = React.useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = React.useCallback(() => setOverlayOpen(false), []);

  const value: Ctx = {
    pinned,
    collapsed,
    overlayOpen,
    setPinned,
    setCollapsed,
    setOverlayOpen,
    togglePinned,
    toggleCollapsed,
    openOverlay,
    closeOverlay,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// default export também disponível (para evitar erros de import default)
export default SidebarProvider;
