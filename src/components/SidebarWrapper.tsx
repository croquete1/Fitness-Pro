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
  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
};

const SidebarCtx = createContext<SidebarCtxShape | null>(null);

/** Hook de estado da sidebar (seguro mesmo se o Provider não estiver montado no SSR) */
export default function useSidebarState(): SidebarCtxShape {
  const ctx = useContext(SidebarCtx);
  if (ctx) return ctx;

  // Fallback silencioso em SSR/edge — evita crashes no build.
  const noop = () => {};
  return {
    pinned: true,
    collapsed: false,
    overlayOpen: false,
    setPinned: noop,
    setCollapsed: noop,
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

  // Hydrate from localStorage
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

  // Persist
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
      togglePinned,
      toggleCollapsed,
      openOverlay,
      closeOverlay,
    }),
    [pinned, collapsed, overlayOpen, togglePinned, toggleCollapsed, openOverlay, closeOverlay]
  );

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}
