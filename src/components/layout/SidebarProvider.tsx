'use client';

import React from 'react';

type SidebarState = {
  pinned: boolean;
  collapsed: boolean;
  togglePinned: () => void;
  toggleCollapsed: () => void;
  setPinned: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
};

const Ctx = React.createContext<SidebarState | null>(null);
export const useSidebar = () => {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
};

function readAttr(name: string, fallback: '0' | '1') {
  if (typeof document === 'undefined') return fallback;
  return (document.documentElement.getAttribute(name) as '0' | '1' | null) ?? fallback;
}

function persist(pinned: boolean, collapsed: boolean) {
  if (typeof document === 'undefined') return;
  const doc = document.documentElement;
  doc.setAttribute('data-sb-pinned', pinned ? '1' : '0');
  doc.setAttribute('data-sb-collapsed', collapsed ? '1' : '0');
  try {
    localStorage.setItem('fp.sb.pinned', pinned ? '1' : '0');
    localStorage.setItem('fp.sb.collapsed', collapsed ? '1' : '0');
  } catch {}
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem('fp.sb.pinned');
    if (v === '0' || v === '1') return v === '1';
    return readAttr('data-sb-pinned', '1') === '1';
  });
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const v = localStorage.getItem('fp.sb.collapsed');
    if (v === '0' || v === '1') return v === '1';
    return readAttr('data-sb-collapsed', '0') === '1';
  });

  React.useEffect(() => {
    persist(pinned, collapsed);
  }, [pinned, collapsed]);

  const value = React.useMemo<SidebarState>(
    () => ({
      pinned,
      collapsed,
      setPinned,
      setCollapsed,
      togglePinned: () => setPinned((v) => !v),
      toggleCollapsed: () => setCollapsed((v) => !v),
    }),
    [pinned, collapsed]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export default SidebarProvider;
