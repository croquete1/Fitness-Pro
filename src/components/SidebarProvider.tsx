"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Prefs = { pinned: boolean; collapsed: boolean };
type SidebarCtx = {
  // estado
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  isMobile: boolean;
  railWidth: number;     // px
  panelWidth: number;    // px

  // derivados
  isExpanded: boolean;   // pinned && !collapsed

  // ações
  setPinned: (v: boolean) => void;
  togglePinned: () => void;

  setCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;

  setOverlayOpen: (v: boolean) => void;
  openOverlay: () => void;
  closeOverlay: () => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

// chaves e dimensões
const STORAGE_KEY = "fp:sidebar:v1";
const RAIL = 64;      // 16 * 4
const PANEL = 288;    // 72 * 4 (w-72 em Tailwind)

function readPrefs(): Prefs {
  if (typeof window === "undefined") return { pinned: true, collapsed: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pinned: true, collapsed: false };
    const obj = JSON.parse(raw) as Partial<Prefs>;
    return {
      pinned: obj.pinned ?? true,
      collapsed: obj.collapsed ?? false,
    };
  } catch {
    return { pinned: true, collapsed: false };
  }
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  // preferências do utilizador
  const [pinned, setPinned] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // overlay (modo desafixado ou hover em rail compacto)
  const [overlayOpen, setOverlayOpen] = useState(false);

  // mobile (sem hover)
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // montar: aplicar preferências e media-query sem “flash”
  useEffect(() => {
    const p = readPrefs();
    setPinned(p.pinned);
    setCollapsed(p.collapsed);

    const mq = window.matchMedia("(max-width: 1024px)");
    const onMQ = () => setIsMobile(mq.matches);
    onMQ();
    mq.addEventListener("change", onMQ);
    return () => mq.removeEventListener("change", onMQ);
  }, []);

  // persistir preferências
  useEffect(() => {
    try {
      const payload: Prefs = { pinned, collapsed };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [pinned, collapsed]);

  // derivados
  const isExpanded = pinned && !collapsed;

  const value = useMemo<SidebarCtx>(() => ({
    pinned,
    collapsed,
    overlayOpen,
    isMobile,
    railWidth: RAIL,
    panelWidth: PANEL,
    isExpanded,

    setPinned: (v) => setPinned(v),
    togglePinned: () => setPinned((x) => !x),

    setCollapsed: (v) => setCollapsed(v),
    toggleCollapsed: () => setCollapsed((x) => !x),

    setOverlayOpen,
    openOverlay: () => setOverlayOpen(true),
    closeOverlay: () => setOverlayOpen(false),
  }), [pinned, collapsed, overlayOpen, isMobile, isExpanded]);

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
  }