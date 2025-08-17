"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Sidebar from "./Sidebar";

type SidebarState = {
  pinned: boolean;
  collapsed: boolean;
  overlayOpen: boolean;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
  setOverlayOpen: (v: boolean) => void;
  togglePinned: () => void;
  toggleCollapsed: () => void;
};

// Contexto
const SidebarCtx = createContext<SidebarState | null>(null);

// Hook novo (API atual)
export function useSidebar() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("SidebarCtx not mounted");
  return ctx;
}

// 🔁 Shim de compatibilidade para código antigo (p.ex. AppHeader):
// exporta useSidebarState com a mesma assinatura do useSidebar
export function useSidebarState() {
  return useSidebar();
}

// Provider + layout (mantém classes esperadas pela tua CSS)
export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Se não estiver afixada (ex.: overlay), colapsa rótulos
  useEffect(() => {
    if (!pinned) setCollapsed(true);
  }, [pinned]);

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
    }),
    [pinned, collapsed, overlayOpen]
  );

  return (
    <SidebarCtx.Provider value={value}>
      <div
        className="fp-shell"
        // usar data-* diretamente no JSX evita o erro de typing em HTMLAttributes
        data-pinned={pinned ? "" : undefined}
        data-collapsed={collapsed ? "" : undefined}
        data-overlay={overlayOpen ? "" : undefined}
      >
        <aside className="sidebar">
          <Sidebar />
        </aside>
        <main className="content">{children}</main>
      </div>
    </SidebarCtx.Provider>
  );
}
