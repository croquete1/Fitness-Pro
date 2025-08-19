"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SidebarCtx = {
  collapsed: boolean;
  pinned: boolean;
  overlay: boolean;
  toggleCollapsed: () => void;
  togglePinned: () => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export const useSidebarState = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("SidebarContext not found");
  return ctx;
};

function readBoot() {
  if (typeof document === "undefined")
    return { collapsed: false, pinned: true };
  return {
    collapsed: document.documentElement.dataset.sbCollapsed === "1",
    pinned: document.documentElement.dataset.sbPinned === "1",
  };
}

export default function SidebarProvider({ children }: { children: ReactNode }) {
  const boot = readBoot();

  const [collapsed, setCollapsed] = useState<boolean>(boot.collapsed);
  const [pinned, setPinned] = useState<boolean>(boot.pinned);

  // A tua lógica: quando não está "pinned" a navegação atua como overlay
  const overlay = !pinned;

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const togglePinned = useCallback(() => setPinned((p) => !p), []);

  // Sincroniza data-attributes + CSS vars + localStorage
  useEffect(() => {
    if (typeof document === "undefined") return;
    const d = document.documentElement;

    d.dataset.sbCollapsed = collapsed ? "1" : "0";
    d.dataset.sbPinned = pinned ? "1" : "0";
    d.style.setProperty("--sb-w", collapsed ? "64px" : "260px");

    try {
      localStorage.setItem(
        "fp:sidebar",
        JSON.stringify({ collapsed, pinned })
      );
    } catch {}
  }, [collapsed, pinned]);

  const value = useMemo(
    () => ({ collapsed, pinned, overlay, toggleCollapsed, togglePinned }),
    [collapsed, pinned, overlay, toggleCollapsed, togglePinned]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
