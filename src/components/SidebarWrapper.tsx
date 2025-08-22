'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Ctx = {
  collapsed: boolean;
  pinned: boolean;
  toggleCollapsed: () => void;
  togglePinned: () => void;
  setCollapsed: (v: boolean) => void;
  setPinned: (v: boolean) => void;
};

const SidebarContext = createContext<Ctx | null>(null);

/** Helpers para refletir no DOM + localStorage (também usados no fallback) */
function applyCollapsedToDOM(v: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-sb-collapsed', v ? '1' : '0');
  try { localStorage.setItem('fp:sb:collapsed', v ? '1' : '0'); } catch {}
  // atualiza a coluna da grid
  const cs = getComputedStyle(root);
  const val = (v ? cs.getPropertyValue('--sb-width-collapsed') : cs.getPropertyValue('--sb-width')).trim();
  root.style.setProperty('--sb-col', val);
}
function applyPinnedToDOM(v: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-sb-pinned', v ? '1' : '0');
  try { localStorage.setItem('fp:sb:pinned', v ? '1' : '0'); } catch {}
}

export function useSidebar(): Ctx {
  const ctx = useContext(SidebarContext);
  if (ctx) return ctx;

  // --- Fallback seguro ---
  // Se, por alguma razão, um consumidor renderizar fora do provider, não crasha.
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  const collapsed = root?.getAttribute('data-sb-collapsed') === '1';
  const pinned = root?.getAttribute('data-sb-pinned') === '1';

  return {
    collapsed,
    pinned,
    toggleCollapsed: () => applyCollapsedToDOM(!collapsed),
    togglePinned: () => applyPinnedToDOM(!pinned),
    setCollapsed: applyCollapsedToDOM,
    setPinned: applyPinnedToDOM,
  };
}

function readBoolLS(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {}
  return fallback;
}

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);

  // Boot dos estados a partir do localStorage (apenas cliente)
  useEffect(() => {
    const c = readBoolLS('fp:sb:collapsed', false);
    const p = readBoolLS('fp:sb:pinned', true);
    setCollapsed(c);
    setPinned(p && !c); // não pode estar pinned se estiver colapsada
  }, []);

  // Reflete collapsed no DOM e sincroniza com pin
  useEffect(() => {
    applyCollapsedToDOM(collapsed);
    if (collapsed && pinned) setPinned(false);
  }, [collapsed]);

  // Reflete pinned no DOM e sincroniza com collapsed
  useEffect(() => {
    applyPinnedToDOM(pinned);
    if (pinned) setCollapsed(false);
  }, [pinned]);

  const toggleCollapsed = useCallback(() => setCollapsed(v => !v), []);
  const togglePinned = useCallback(() => setPinned(v => !v), []);

  const value = useMemo(
    () => ({ collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed, setPinned }),
    [collapsed, pinned, toggleCollapsed, togglePinned]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
