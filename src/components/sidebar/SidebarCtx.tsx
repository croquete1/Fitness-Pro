"use client";
import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

type SidebarState = {
  pinned: boolean;                 // afixada à viewport (desktop)
  collapsed: boolean;              // só ícones
  mobileOpen: boolean;             // off-canvas aberto
  setPinned: (v: boolean)=>void;
  setCollapsed: (v: boolean)=>void;
  openMobile: ()=>void;
  closeMobile: ()=>void;
  togglePinned: ()=>void;
  toggleCollapsed: ()=>void;
};

const noop = () => {};
const defaultValue: SidebarState = {
  pinned: true,
  collapsed: false,
  mobileOpen: false,
  setPinned: noop, setCollapsed: noop,
  openMobile: noop, closeMobile: noop,
  togglePinned: noop, toggleCollapsed: noop,
};

const Ctx = createContext<SidebarState>(defaultValue);
export const useSidebar = () => useContext(Ctx);

/** Provider “à prova de bala”: não lança erros em SSR e persiste estado em localStorage */
export function SidebarProvider({children}:{children:React.ReactNode}){
  const isClient = typeof window !== "undefined";
  const [pinned, setPinned] = useState<boolean>(() => {
    if (!isClient) return true;
    return localStorage.getItem("fp.sidebar.pinned") !== "false";
  });
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (!isClient) return false;
    return localStorage.getItem("fp.sidebar.collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { if (isClient) localStorage.setItem("fp.sidebar.pinned", String(pinned)); }, [pinned, isClient]);
  useEffect(() => { if (isClient) localStorage.setItem("fp.sidebar.collapsed", String(collapsed)); }, [collapsed, isClient]);

  const value = useMemo<SidebarState>(()=>({
    pinned, collapsed, mobileOpen,
    setPinned, setCollapsed,
    openMobile: ()=>setMobileOpen(true),
    closeMobile: ()=>setMobileOpen(false),
    togglePinned: ()=>setPinned(v=>!v),
    toggleCollapsed: ()=>setCollapsed(v=>!v),
  }),[pinned,collapsed,mobileOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
