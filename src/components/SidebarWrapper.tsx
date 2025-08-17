"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SidebarCtx = {
  collapsed: boolean;
  pinned: boolean;
  overlayOpen: boolean;
  // actions
  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;
  togglePinned: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

const LS_KEY = "fp:sidebar:v1"; // guarda preferências do utilizador

function loadPrefs() {
  if (typeof window === "undefined") return { collapsed: false, pinned: true };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { collapsed: false, pinned: true };
    const parsed = JSON.parse(raw) as Partial<{ collapsed: boolean; pinned: boolean }>;
    return {
      collapsed: !!parsed.collapsed,
      pinned: parsed.pinned ?? true,
    };
  } catch {
    return { collapsed: false, pinned: true };
  }
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const booted = useRef(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [pinned, setPinned] = useState<boolean>(true);
  const [overlayOpen, setOverlayOpen] = useState<boolean>(false);

  // carregar preferências do utilizador (primeiro render no cliente)
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const prefs = loadPrefs();
    setCollapsed(prefs.collapsed);
    setPinned(prefs.pinned);
  }, []);

  // persistir alterações
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_KEY, JSON.stringify({ collapsed, pinned }));
  }, [collapsed, pinned]);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const togglePinned = useCallback(() => setPinned((v) => !v), []);
  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  const value = useMemo<SidebarCtx>(
    () => ({
      collapsed,
      pinned,
      overlayOpen,
      toggleCollapsed,
      setCollapsed,
      togglePinned,
      openOverlay,
      closeOverlay,
    }),
    [collapsed, pinned, overlayOpen, toggleCollapsed, openOverlay, closeOverlay]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export default function useSidebarState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebarState must be used inside <SidebarProvider>");
  return ctx;
}
