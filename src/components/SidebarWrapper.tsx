"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SidebarCtxShape = {
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  /** Setter bruto para compatibilidade com componentes antigos */
  setOverlayOpen: (v: boolean) => void;

  togglePinned: () => void;
  toggleCollapsed: () => void;

  /** Helpers opcionais */
  openOverlay: () => void;
  closeOverlay: () => void;
};

const SidebarCtx = createContext<SidebarCtxShape | null>(null);

/** Hook seguro (fallback em SSR/sem Provider para evitar crashes em build) */
function useSidebarState(): SidebarCtxShape {
  const ctx = useContext(SidebarCtx);
  if (ctx) return ctx;

  const noop = () => {};
  return {
    pinned: true,
    collapsed: false,
    overlayOpen: false,
    setPinned: noop,
    setCollapsed: noop,
    setOverlayOpen: noop,
    togglePinned: noop,
    toggleCollapsed: noop,
    openOverlay: noop,
    closeOverlay: noop,
  };
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Hydration a partir de localStorage
  useEffect(() => {
    try {
      const p = localStorage.getItem("fp:sb:pinned");
      const c = localStorage.getItem("fp:sb:collapsed");
      if (p !== null) setPinned(p === "1");
      if (c !== null) setCollapsed(c === "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Persistência
  useEffect(() => {
    try {
      localStorage.setItem("fp:sb:pinned", pinned ? "1" : "0");
    } catch {}
  }, [pinned]);

  useEffect(() => {
    try {
      localStorage.setItem("fp:sb:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  const togglePinned = useCallback(() => setPinned((v) => !v), []);
  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  const value = useMemo(
    () => ({
      pinned,
      collapsed,
      overlayOpen,
      setPinned,
      setCollapsed,
      setOverlayOpen, // <- exposto para compatibilidade
      togglePinned,
      toggleCollapsed,
      openOverlay,
      closeOverlay,
    }),
    [
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
    ]
  );

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

/* Disponível como default e named export */
export default useSidebarState;
export { useSidebarState };
