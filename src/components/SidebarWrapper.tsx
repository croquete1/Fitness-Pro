// src/components/SidebarWrapper.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Ctx = {
  collapsed: boolean;
  pinned: boolean;
  toggleCollapsed: () => void;
  togglePinned: () => void;
  setCollapsed: (v: boolean) => void;
  setPinned: (v: boolean) => void;
};

const SidebarContext = createContext<Ctx | undefined>(undefined);

function readLS(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {}
  return fallback;
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // boot (client)
  useEffect(() => {
    const c = readLS("fp:sb:collapsed", false);
    const p = readLS("fp:sb:pinned", true);
    setCollapsed(c);
    setPinned(p && !c); // não pode estar pinned se estiver colapsada
  }, []);

  // reflect 'collapsed'
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-sb-collapsed", collapsed ? "true" : "false");
    try {
      localStorage.setItem("fp:sb:collapsed", collapsed ? "1" : "0");
    } catch {}
    if (collapsed && pinned) setPinned(false); // se encolheres, desfixa
  }, [collapsed, pinned]);

  // reflect 'pinned'
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-sb-pinned", pinned ? "true" : "false");
    try {
      localStorage.setItem("fp:sb:pinned", pinned ? "1" : "0");
    } catch {}
    if (pinned) setCollapsed(false); // afixar => força expandida
  }, [pinned]);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const togglePinned = useCallback(() => setPinned((v) => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

/** Hook seguro: se o Provider faltar, não quebra a UI (no-ops) */
export function useSidebar(): Ctx {
  const ctx = useContext(SidebarContext);
  if (ctx) return ctx;

  // Fallback silencioso (para não rebentar a página em produção)
  return {
    collapsed: false,
    pinned: true,
    toggleCollapsed: () => {},
    togglePinned: () => {},
    setCollapsed: () => {},
    setPinned: () => {},
  };
}
