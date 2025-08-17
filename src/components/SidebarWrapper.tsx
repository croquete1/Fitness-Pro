"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** Estado/acciones expostas pela sidebar */
type SidebarContext = {
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  setOverlayOpen: (v: boolean) => void;
  togglePinned: () => void;
  toggleCollapsed: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
};

// noops p/ fallback seguro (evita crash em SSR/prerender)
const noop = () => {};
const DEFAULT_CTX: SidebarContext = {
  pinned: true,
  collapsed: false,
  overlayOpen: false,
  setPinned: noop,
  setCollapsed: noop,
  setOverlayOpen: noop,
  togglePinned: noop,
  toggleCollapsed: noop,
  openOverlay: noop,
  closeOverlay: noop,
};

const Ctx = createContext<SidebarContext | null>(null);

/** Hook — default export (suporta `import useSidebarState from "./SidebarWrapper"`) */
function useSidebarState(): SidebarContext {
  const ctx = useContext(Ctx);
  // Fallback “à prova de bala”: nunca lança erro durante build/SSR
  return ctx ?? DEFAULT_CTX;
}

/** Provider com persistência (localStorage) e atalhos */
function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Carregar preferências gravadas
  useEffect(() => {
    try {
      const p = localStorage.getItem("fp-sidebar:pinned");
      const c = localStorage.getItem("fp-sidebar:collapsed");
      if (p !== null) setPinned(p === "1");
      if (c !== null) setCollapsed(c === "1");
    } catch {}
  }, []);

  // Guardar alterações
  useEffect(() => {
    try {
      localStorage.setItem("fp-sidebar:pinned", pinned ? "1" : "0");
    } catch {}
  }, [pinned]);

  useEffect(() => {
    try {
      localStorage.setItem("fp-sidebar:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  // ESC fecha overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlayOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<SidebarContext>(
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

/** Wrapper de compatibilidade: alguns ficheiros podem importar este nome */
function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

// ✅ default export para `import useSidebarState from "./SidebarWrapper"`
export default useSidebarState;

// ✅ também disponível como named export (compatibilidade com imports antigos)
export { useSidebarState, SidebarProvider, SidebarWrapper };
