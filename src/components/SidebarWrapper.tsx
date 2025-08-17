"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** Estado partilhado da sidebar */
type SidebarCtx = {
  /** Se está “afixada” (fixa). Quando não está afixada, abre por overlay ao passar o rato. */
  pinned: boolean;
  /** Se está recolhida (rail). */
  collapsed: boolean;
  /** Overlay aberto (apenas quando !pinned). */
  overlayOpen: boolean;

  /** Ações */
  togglePinned(): void;
  toggleCollapsed(): void;
  openOverlay(): void;
  closeOverlay(): void;
  setOverlayOpen(v: boolean): void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

/** key com “v2” para evitar lixo antigo */
const STORAGE_KEY = "fp.sidebar.v2";

function readStored(): { pinned: boolean; collapsed: boolean } {
  if (typeof window === "undefined")
    return { pinned: true, collapsed: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pinned: true, collapsed: false };
    const parsed = JSON.parse(raw);
    return {
      pinned: typeof parsed.pinned === "boolean" ? parsed.pinned : true,
      collapsed:
        typeof parsed.collapsed === "boolean" ? parsed.collapsed : false,
    };
  } catch {
    return { pinned: true, collapsed: false };
  }
}

function writeStored(v: { pinned: boolean; collapsed: boolean }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

/** Provider (default export). O hook é exportado com nome. */
export default function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const init = readStored();
  const [pinned, setPinned] = useState(init.pinned);
  const [collapsed, setCollapsed] = useState(init.collapsed);
  const [overlayOpen, setOverlayOpen] = useState(false);

  /** persistir preferências do utilizador */
  useEffect(() => {
    writeStored({ pinned, collapsed });
  }, [pinned, collapsed]);

  const togglePinned = useCallback(() => {
    setPinned((v) => !v);
    // se deixar de estar afixada e estiver recolhida, fechamos o overlay
    setOverlayOpen(false);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => !v);
  }, []);

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  /** dependências completas -> sem warning de `react-hooks/exhaustive-deps` */
  const value = useMemo(
    () => ({
      pinned,
      collapsed,
      overlayOpen,
      togglePinned,
      toggleCollapsed,
      openOverlay,
      closeOverlay,
      setOverlayOpen,
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
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState(): SidebarCtx {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebarState must be used within SidebarProvider");
  return ctx;
}
