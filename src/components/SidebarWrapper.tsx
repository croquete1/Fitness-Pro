"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SidebarCtx = {
  pinned: boolean;
  collapsed: boolean;
  open: boolean;                // drawer aberto (quando não afixada)
  // Ações
  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
  setOpen: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

const LS_PINNED = "fp.sidebar.pinned";
const LS_COLLAPSED = "fp.sidebar.collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // preferências persistentes
  const [pinned, setPinned] = useState<boolean>(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem(LS_PINNED) : null;
    return v ? v === "1" : true; // por defeito afixada
  });

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem(LS_COLLAPSED) : null;
    return v ? v === "1" : false;
  });

  // estado de overlay (só interessa quando !pinned)
  const [open, setOpen] = useState<boolean>(false);

  // persistência
  useEffect(() => {
    try { localStorage.setItem(LS_PINNED, pinned ? "1" : "0"); } catch {}
  }, [pinned]);

  useEffect(() => {
    try { localStorage.setItem(LS_COLLAPSED, collapsed ? "1" : "0"); } catch {}
  }, [collapsed]);

  // ações
  const togglePinned = useCallback(() => {
    setPinned((p) => {
      const next = !p;
      if (next === true) {
        // se voltar a afixar, fecha o drawer
        setOpen(false);
      }
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  const openOverlay = useCallback(() => setOpen(true), []);
  const closeOverlay = useCallback(() => setOpen(false), []);

  // valor memoizado (inclui todas as deps -> sem aviso do ESLint)
  const value = useMemo<SidebarCtx>(
    () => ({
      pinned,
      collapsed,
      open,
      togglePinned,
      toggleCollapsed,
      openOverlay,
      closeOverlay,
      setOpen,
    }),
    [pinned, collapsed, open, togglePinned, toggleCollapsed, openOverlay, closeOverlay]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// hook (named + default export para evitar erros de import)
export const useSidebarState = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebarState must be used inside <SidebarProvider />");
  return ctx;
};
export default useSidebarState;
