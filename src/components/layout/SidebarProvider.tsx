'use client';

import * as React from 'react';

export type SidebarCtx = {
  // Desktop
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  /** Alterna inteligentemente: desktop = colapsa/expande; mobile = abre/fecha */
  toggle: () => void;
  /** Alterna apenas o "collapse" do desktop (compat com código legado) */
  toggleCollapse: () => void;

  // "pinned" (se usares modo overlay/auto-hide)
  pinned: boolean;
  setPinned: (v: boolean) => void;

  // Mobile drawer
  mobileOpen: boolean;
  /** Alias legacy que alguns componentes usam */
  open: boolean;
  openMobile: (open: boolean) => void;
  closeMobile: () => void;

  // Peek (pré-visualização quando colapsada — compat com SidebarBase.tsx)
  peek: boolean;
  setPeek: (v: boolean) => void;

  // Utils / breakpoints
  isMobile: boolean;
  railWidth: number;   // 64px
  panelWidth: number;  // 260px
};

const SidebarContext = React.createContext<SidebarCtx | null>(null);

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [pinned, setPinned] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [peek, setPeek] = React.useState(false); // 👈 novo

  // detetar mobile (≤ 1023px)
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

  // larguras (alinha com globals.css)
  const railWidth = 64;
  const panelWidth = 260;

  // data-attrs consumidos pelo CSS global
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
    html.setAttribute('data-sb-pinned', pinned ? '1' : '0');
    html.setAttribute('data-sb-mobile-open', mobileOpen ? '1' : '0');
    html.setAttribute('data-sb-peek', peek ? '1' : '0'); // 👈 novo (opcional para CSS)
  }, [collapsed, pinned, mobileOpen, peek]);

  // ESC fecha drawer mobile
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Ações
  const openMobile  = (open: boolean) => setMobileOpen(open);
  const closeMobile = () => setMobileOpen(false);
  const toggle      = () => { isMobile ? setMobileOpen(v => !v) : setCollapsed(c => !c); };
  const toggleCollapse = () => setCollapsed(c => !c); // compat

  const value: SidebarCtx = {
    collapsed, setCollapsed, toggle, toggleCollapse,
    pinned, setPinned,
    mobileOpen,
    open: mobileOpen,      // alias compat
    openMobile, closeMobile,
    peek, setPeek,         // 👈 expostos
    isMobile,
    railWidth, panelWidth,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarCtx {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}

// Compat: permite também `import { SidebarProvider } from ...`
export { SidebarProvider };
