'use client';

import * as React from 'react';

export type SidebarCtx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  toggleCollapse: () => void;

  pinned: boolean;
  setPinned: (v: boolean) => void;

  mobileOpen: boolean;
  open: boolean;
  openMobile: (open: boolean) => void;
  closeMobile: () => void;

  peek: boolean;
  setPeek: (v: boolean) => void;

  isMobile: boolean;
  railWidth: number;
  panelWidth: number;
};

const Ctx = React.createContext<SidebarCtx | null>(null);

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [pinned, setPinned] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [peek, setPeek] = React.useState(false);

  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 1023px)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const railWidth = 64;
  const panelWidth = 260;

  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
    html.setAttribute('data-sb-pinned', pinned ? '1' : '0');
    html.setAttribute('data-sb-mobile-open', mobileOpen ? '1' : '0');
    html.setAttribute('data-sb-peek', peek ? '1' : '0');
  }, [collapsed, pinned, mobileOpen, peek]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openMobile  = (open: boolean) => setMobileOpen(open);
  const closeMobile = () => setMobileOpen(false);
  const toggle = () => { isMobile ? setMobileOpen(v => !v) : setCollapsed(c => !c); };
  const toggleCollapse = () => setCollapsed(c => !c);

  const value: SidebarCtx = {
    collapsed, setCollapsed, toggle, toggleCollapse,
    pinned, setPinned,
    mobileOpen, open: mobileOpen, openMobile, closeMobile,
    peek, setPeek,
    isMobile, railWidth, panelWidth,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar(): SidebarCtx {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return v;
}

// named export de compat
export { SidebarProvider };
