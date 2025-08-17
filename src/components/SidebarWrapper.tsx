"use client";

import React from "react";

type Ctx = {
  /** fixar a sidebar ao layout (empurra o conteúdo) */
  pinned: boolean;
  /** recolhida (larga=260px vs estreita=72px) quando está fixa */
  collapsed: boolean;
  /** overlay aberto quando NÃO está fixa (pairar aproxima) */
  overlayOpen: boolean;

  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  setOverlayOpen: (v: boolean) => void;

  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
};

const SidebarCtx = React.createContext<Ctx | null>(null);

/** Hook nomeado (para evitar confusões com default import) */
export function useSidebarState(): Ctx {
  const ctx = React.useContext(SidebarCtx);
  if (!ctx) throw new Error("SidebarCtx not mounted");
  return ctx;
}

/** Provider com persistência em localStorage */
export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("fp.sb.pinned");
    return v === null ? true : v === "true";
  });

  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const v = localStorage.getItem("fp.sb.collapsed");
    return v === "true";
  });

  const [overlayOpen, setOverlayOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("fp.sb.pinned", String(pinned));
    // se desafixar, força recolhida (apenas ícones)
    if (!pinned) setCollapsed(true);
  }, [pinned]);

  React.useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("fp.sb.collapsed", String(collapsed));
  }, [collapsed]);

  const value: Ctx = {
    pinned,
    collapsed,
    overlayOpen,

    setPinned,
    setCollapsed,
    setOverlayOpen,

    togglePinned: () => setPinned((v) => !v),
    toggleCollapsed: () => setCollapsed((v) => !v),

    openOverlay: () => setOverlayOpen(true),
    closeOverlay: () => setOverlayOpen(false),
  };

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>;
}
