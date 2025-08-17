"use client";

import React from "react";

/** Chave de persistência */
const LS_KEYS = {
  pinned: "fp:pinned",
  collapsed: "fp:collapsed",
} as const;

type SidebarCtx = {
  /** Está pinada (fixa na esquerda) */
  pinned: boolean;
  /** Estado de colapso pedido pelo utilizador */
  collapsed: boolean;
  /** Colapso efetivo (considera “hover peek”) */
  collapsedEffective: boolean;
  /** Está em mobile/overlay */
  isMobile: boolean;
  /** Em modo overlay, está aberta? */
  open: boolean;
  /** É overlay (não pinada OU mobile) */
  overlay: boolean;

  /** Ações principais */
  pin: () => void;
  unpin: () => void;
  togglePin: () => void;

  collapse: () => void;
  expand: () => void;
  toggleCollapse: () => void;

  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  /** Hover “peek” para expandir temporariamente quando pinada+colapsada */
  hoverStart: () => void;
  hoverEnd: () => void;
};

const Ctx = React.createContext<SidebarCtx | null>(null);

function useMediaQuery(query: string) {
  const [match, setMatch] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = () => setMatch(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [query]);
  return match;
}

export function SidebarStateProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 1023.98px)");

  // Carregar preferências (SSR-safe)
  const [pinned, setPinned] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = window.localStorage.getItem(LS_KEYS.pinned);
    return v ? v === "1" : true; // por defeito: pinada em desktop
  });
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const v = window.localStorage.getItem(LS_KEYS.collapsed);
    return v ? v === "1" : false;
  });

  // Overlay abre/fecha
  const [open, setOpen] = React.useState(false);

  // “peek” quando o rato encosta à esquerda com sidebar pinada e colapsada
  const [hoverPeek, setHoverPeek] = React.useState(false);

  // Em mobile, forçamos overlay (não pinada) e fechada inicialmente
  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  // persistência
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_KEYS.pinned, pinned ? "1" : "0");
  }, [pinned]);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_KEYS.collapsed, collapsed ? "1" : "0");
  }, [collapsed]);

  const overlay = !pinned || isMobile;

  // Colapso “efetivo”: se estiver em hoverPeek, mostramos expandida temporariamente
  const collapsedEffective = pinned ? (collapsed && !hoverPeek) : false;

  const api: SidebarCtx = {
    pinned,
    collapsed,
    collapsedEffective,
    isMobile,
    open,
    overlay,

    pin: () => setPinned(true),
    unpin: () => {
      setPinned(false);
      setOpen(false);
    },
    togglePin: () => setPinned((v) => !v),

    collapse: () => setCollapsed(true),
    expand: () => setCollapsed(false),
    toggleCollapse: () => setCollapsed((v) => !v),

    openSidebar: () => setOpen(true),
    closeSidebar: () => setOpen(false),
    toggleSidebar: () => setOpen((v) => !v),

    hoverStart: () => setHoverPeek(true),
    hoverEnd: () => setHoverPeek(false),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSidebarState() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useSidebarState must be used inside SidebarStateProvider");
  return ctx;
}
