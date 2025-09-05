// src/components/layout/SidebarProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

export type SidebarCtx = {
  /** Mobile drawer aberto/fechado */
  open: boolean;
  setOpen: (v: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  /** Alias de compatibilidade (alguns componentes usam `toggle`) */
  toggle: () => void;

  /** Estado de colapso (desktop) */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Alias de compatibilidade */
  toggleCollapse: () => void;

  /** Estado “fixo” (desktop): sidebar fica sempre visível */
  pinned: boolean;
  togglePinned: () => void;
  /** Alias de compatibilidade */
  togglePin: () => void;

  /** Flag de viewport mobile (≤ 1024px) */
  isMobile: boolean;
};

const SidebarContext = createContext<SidebarCtx | undefined>(undefined);

const LS_COL = 'sb_collapsed';
const LS_PIN = 'sb_pinned';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Lazy init para evitar flash de estado após hidratação
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const c = localStorage.getItem(LS_COL);
      return c === '1';
    } catch {
      return false;
    }
  });

  const [pinned, setPinned] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const p = localStorage.getItem(LS_PIN);
      return p === '1';
    } catch {
      return false;
    }
  });

  const [open, _setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 1024px)').matches;
  });

  // Atualizar flag mobile com matchMedia
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Ao entrar em mobile, fecha overlay por padrão
  useEffect(() => {
    if (isMobile) _setOpen(false);
  }, [isMobile]);

  // Ações estáveis
  const setOpen = useCallback((v: boolean) => _setOpen(v), []);
  const openSidebar = useCallback(() => _setOpen(true), []);
  const closeSidebar = useCallback(() => _setOpen(false), []);
  const toggleSidebar = useCallback(() => _setOpen((v) => !v), []);
  const toggle = toggleSidebar; // alias

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const nv = !v;
      try {
        localStorage.setItem(LS_COL, nv ? '1' : '0');
      } catch {}
      return nv;
    });
  }, []);
  const toggleCollapse = toggleCollapsed; // alias

  const togglePinned = useCallback(() => {
    setPinned((v) => {
      const nv = !v;
      try {
        localStorage.setItem(LS_PIN, nv ? '1' : '0');
      } catch {}
      // Se desafixar (unpinned), fecha overlay por padrão
      if (!nv) _setOpen(false);
      return nv;
    });
  }, []);
  const togglePin = togglePinned; // alias

  const value = useMemo<SidebarCtx>(
    () => ({
      open,
      setOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      toggle,
      collapsed,
      toggleCollapsed,
      toggleCollapse,
      pinned,
      togglePinned,
      togglePin,
      isMobile,
    }),
    [
      open,
      setOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      toggle,
      collapsed,
      toggleCollapsed,
      toggleCollapse,
      pinned,
      togglePinned,
      togglePin,
      isMobile,
    ]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}

// Para compatibilidade com imports existentes
export default SidebarProvider;
