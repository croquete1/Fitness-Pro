"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SidebarCtx = {
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

const SidebarContext = createContext<SidebarCtx | null>(null);

const STORAGE_PINNED = "fp.sidebar.pinned";
const STORAGE_COLLAPSED = "fp.sidebar.collapsed";

function readBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // defaults: inicia em rail compacto (pinned=false, collapsed=true)
  const [pinned, setPinned] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // hidratar preferências
  useEffect(() => {
    if (typeof window === "undefined") return;
    setPinned(readBool(STORAGE_PINNED, false));
    setCollapsed(readBool(STORAGE_COLLAPSED, true));
  }, []);

  // persistir
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_PINNED, pinned ? "1" : "0");
  }, [pinned]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_COLLAPSED, collapsed ? "1" : "0");
  }, [collapsed]);

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);
  const togglePinned = useCallback(() => setPinned((p) => !p), []);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  // ✅ incluir todas as deps para satisfazer o eslint
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
    [
      pinned,
      collapsed,
      overlayOpen,
      setPinned,
      setCollapsed,
      togglePinned,
      toggleCollapsed,
      openOverlay,
      closeOverlay,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

// hook (named export)
export function useSidebarState(): SidebarCtx {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("SidebarCtx not mounted");
  return ctx;
}

// default export também disponível
export default SidebarProvider;
