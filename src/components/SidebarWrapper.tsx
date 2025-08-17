"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** Contexto da sidebar */
type SidebarCtx = {
  pinned: boolean;            // afixada (reserva a largura total)
  collapsed: boolean;         // rail compacto (64px)
  overlayOpen: boolean;       // painel temporário aberto (quando não afixada)
  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

const LS = {
  pinned: "fp:sb:pinned",
  collapsed: "fp:sb:collapsed",
};

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw == null) return fallback;
  return raw === "1" || raw === "true";
}

/** Provider com persistência em localStorage */
export default function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // preferências do utilizador (persistentes)
  const [pinned, setPinned] = useState<boolean>(() => readBool(LS.pinned, true));
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    readBool(LS.collapsed, false)
  );

  // estado efémero (hover quando não afixada)
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS.pinned, pinned ? "1" : "0");
    }
  }, [pinned]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS.collapsed, collapsed ? "1" : "0");
    }
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
      togglePinned,
      toggleCollapsed,
      openOverlay,
      closeOverlay,
      setCollapsed,
    }),
    [
      pinned,
      collapsed,
      overlayOpen,
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

export function useSidebarState() {
  const ctx = useContext(SidebarContext);
  if (!ctx)
    throw new Error("useSidebarState deve ser usado dentro de SidebarProvider");
  return ctx;
}
