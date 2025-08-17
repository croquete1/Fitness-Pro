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
  pinned: boolean;           // sidebar “fixa” (rail = false, expanded = true)
  collapsed: boolean;        // rail compacto quando pinned = true
  overlayOpen: boolean;      // aberto por hover quando NÃO está pinned
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
  // defaults: o normal é iniciar rail compacto (pinned=false ⇒ overlay só por hover)
  const [pinned, setPinned] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // hidratar do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    setPinned(readBool(STORAGE_PINNED, false));
    setCollapsed(readBool(STORAGE_COLLAPSED, true));
  }, []);

  // persistir as preferências
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
    [pinned, collapsed, overlayOpen]
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

// default export também disponível (resolve avisos de import)
export default SidebarProvider;
