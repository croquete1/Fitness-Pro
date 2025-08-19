'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SidebarCtx = {
  collapsed: boolean;
  pinned: boolean;
  toggleCollapsed: () => void;
  togglePinned: () => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function useSidebarState() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSidebarState must be used within <SidebarProvider />');
  return c;
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  // estado inicial sincronizado com o atributo definido pelo boot-script
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-sb-collapsed') === '1';
    }
    return false;
  });

  const [pinned, setPinned] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fp:sb:pinned') === '1';
    }
    return true;
  });

  // quando "collapsed" muda, refletemos no <html> e persistimos
  useEffect(() => {
    const v = collapsed ? '1' : '0';
    document.documentElement.setAttribute('data-sb-collapsed', v);
    try {
      localStorage.setItem('fp:sb:collapsed', v);
    } catch {}
  }, [collapsed]);

  // quando "pinned" muda, persistimos; ao fixar, garantimos expandido
  useEffect(() => {
    const v = pinned ? '1' : '0';
    try {
      localStorage.setItem('fp:sb:pinned', v);
    } catch {}
    if (pinned) setCollapsed(false);
  }, [pinned]);

  const toggleCollapsed = () => setCollapsed((c) => !c);
  const togglePinned = () => setPinned((p) => !p);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned }),
    [collapsed, pinned]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
