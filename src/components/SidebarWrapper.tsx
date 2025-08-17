"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

type SidebarState = {
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  setPinned: Dispatch<SetStateAction<boolean>>;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  setOverlayOpen: Dispatch<SetStateAction<boolean>>;
  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
};

const SidebarCtx = createContext<SidebarState | null>(null);

function useSidebarState(): SidebarState {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("SidebarCtx not mounted");
  return ctx;
}

const LS = {
  pinned: "fp.sidebar.pinned",
  collapsed: "fp.sidebar.collapsed",
};

function SidebarProvider({ children }: { children: ReactNode }) {
  const [pinned, setPinned] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [overlayOpen, setOverlayOpen] = useState<boolean>(false);

  // Hidratar do localStorage (client-only)
  useEffect(() => {
    try {
      const p = localStorage.getItem(LS.pinned);
      const c = localStorage.getItem(LS.collapsed);
      if (p !== null) setPinned(p === "1");
      if (c !== null) setCollapsed(c === "1");
    } catch {
      /* no-op */
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS.pinned, pinned ? "1" : "0"); } catch {}
  }, [pinned]);

  useEffect(() => {
    try { localStorage.setItem(LS.collapsed, collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);

  const value = useMemo<SidebarState>(() => ({
    pinned,
    collapsed,
    overlayOpen,
    setPinned,
    setCollapsed,
    setOverlayOpen,
    togglePinned: () => setPinned(v => !v),
    toggleCollapsed: () => setCollapsed(v => !v),
    openOverlay: () => setOverlayOpen(true),
    closeOverlay: () => setOverlayOpen(false),
  }), [pinned, collapsed, overlayOpen]);

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}

export default SidebarProvider;           // default export
export { SidebarProvider, useSidebarState }; // named exports
