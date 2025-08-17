"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type SidebarState = {
  pinned: boolean;               // afixada
  collapsed: boolean;            // encolhida (só ícones)
  overlayOpen: boolean;          // aberta em modo overlay (mobile)
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  setOverlayOpen: (v: boolean) => void;
  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
};

const Ctx = createContext<SidebarState | null>(null);

/** Hook – usa-o como `const s = useSidebarState()` */
export default function useSidebarState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("SidebarCtx not mounted");
  return v;
}

/** Mantém compat com o nome que tinhas: podes importar este componente como <SidebarWrapper> */
export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [overlayOpen, setOverlayOpen] = useState<boolean>(false);

  // Hidratação (evita FOUC e mantém preferências)
  useEffect(() => {
    try {
      const p = localStorage.getItem("fp.sidebar.pinned");
      const c = localStorage.getItem("fp.sidebar.collapsed");
      if (p !== null) setPinned(p === "1");
      if (c !== null) setCollapsed(c === "1");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("fp.sidebar.pinned", pinned ? "1" : "0");
      localStorage.setItem("fp.sidebar.collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [pinned, collapsed]);

  // Controla scroll quando overlay está aberto (mobile)
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  // Fechar overlay clicando fora
  useEffect(() => {
    if (!overlayOpen) return;
    const onClick = (e: MouseEvent) => {
      const el = document.getElementById("app-sidebar");
      if (el && !el.contains(e.target as Node)) setOverlayOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlayOpen(false);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [overlayOpen]);

  const value = useMemo<SidebarState>(
    () => ({
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
    }),
    [pinned, collapsed, overlayOpen]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
