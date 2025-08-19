"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SidebarCtx = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  // no-ops por defeito (substituídos no Provider)
  toggleCollapsed: () => {},
  setCollapsed: () => {},
});

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // sincroniza com localStorage (há também o boot-script no layout para evitar “salto”)
  useEffect(() => {
    try {
      const v = localStorage.getItem("fp:sb:collapsed");
      if (v === "1") setCollapsed(true);
      if (v === "0") setCollapsed(false);
    } catch {}
  }, []);

  // aplica atributo no <html> e persiste
  useEffect(() => {
    document.documentElement.setAttribute("data-sb-collapsed", collapsed ? "1" : "0");
    try {
      localStorage.setItem("fp:sb:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed, setCollapsed }),
    [collapsed, toggleCollapsed]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export const useSidebarState = () => useContext(SidebarContext);
