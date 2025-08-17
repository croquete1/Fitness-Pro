"use client";

import React from "react";

/** Tipos do estado partilhado da sidebar */
type SidebarCtx = {
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  togglePinned: () => void;
  toggleCollapsed: (force?: boolean) => void;
  setOverlayOpen: (v: boolean) => void;
};

const SidebarContext = React.createContext<SidebarCtx | null>(null);

/** Hook para ler/alterar o estado da sidebar (named export) */
export function useSidebarState(): SidebarCtx {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("SidebarCtx not mounted");
  return ctx;
}

/** Provider da Sidebar (DEFAULT EXPORT) */
export default function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // preferências persistidas
  const [pinned, setPinned] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = window.localStorage.getItem("fp:pinned");
    return v ? v === "1" : true;
  });

  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const v = window.localStorage.getItem("fp:collapsed");
    return v ? v === "1" : false;
  });

  const [overlayOpen, setOverlayOpen] = React.useState(false);

  // persistência simples
  React.useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("fp:pinned", pinned ? "1" : "0");
  }, [pinned]);

  React.useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("fp:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const togglePinned = React.useCallback(() => setPinned((v) => !v), []);
  const toggleCollapsed = React.useCallback(
    (force?: boolean) =>
      setCollapsed((v) => (typeof force === "boolean" ? force : !v)),
    []
  );

  const value: SidebarCtx = {
    pinned,
    collapsed,
    overlayOpen,
    togglePinned,
    toggleCollapsed,
    setOverlayOpen,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
