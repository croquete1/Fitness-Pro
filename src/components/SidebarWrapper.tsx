"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Sidebar from "./Sidebar";

/** ---- Contexto partilhado ---- */
type Ctx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  overlayOpen: boolean;
  setOverlayOpen: (v: boolean) => void;
};

const SidebarCtx = createContext<Ctx | null>(null);

/**
 * Hook tolerante a SSR:
 * - Se o provider não estiver montado (ex.: prerender), devolve um “no-op context”
 *   para evitar falhas no build. Em runtime, quando o provider existir, usa-o.
 */
const noop = () => {};
const FALLBACK_CTX: Ctx = {
  collapsed: false,
  setCollapsed: noop,
  overlayOpen: false,
  setOverlayOpen: noop,
};
export function useSidebarState(): Ctx {
  return useContext(SidebarCtx) ?? FALLBACK_CTX;
}

/** ---- Wrapper do layout (sidebar + conteúdo) ---- */
export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);     // estado “fixo” (click)
  const [overlayOpen, setOverlayOpen] = useState(false); // mobile off-canvas
  const [isMobile, setIsMobile] = useState(false);

  // Hover intent: expande temporariamente quando está recolhida (desktop apenas)
  const [hoverExpand, setHoverExpand] = useState(false);
  const enterT = useRef<number>();
  const leaveT = useRef<number>();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener?.("change", handle);
    return () => mq.removeEventListener?.("change", handle);
  }, []);

  // Quando não mobile, garantir overlay fechado
  useEffect(() => {
    if (!isMobile) setOverlayOpen(false);
  }, [isMobile]);

  // “collapsed efetivo”: só colapsa se estiver collapsed e não em hoverExpand
  const effectiveCollapsed = collapsed && !hoverExpand;

  // atributos data-* (tipados via any para agradar ao TS)
  const shellAttrs = useMemo(
    () =>
      ({
        className: "fp-shell",
        "data-collapsed": effectiveCollapsed ? "true" : undefined,
        "data-overlay-open": overlayOpen ? "true" : undefined,
      } as any),
    [effectiveCollapsed, overlayOpen]
  );

  const onAsideEnter = () => {
    if (isMobile) return;          // sem hover em mobile
    if (!collapsed) return;        // se não está recolhida, ignora
    window.clearTimeout(leaveT.current);
    enterT.current = window.setTimeout(() => setHoverExpand(true), 120);
  };
  const onAsideLeave = () => {
    if (isMobile) return;
    window.clearTimeout(enterT.current);
    leaveT.current = window.setTimeout(() => setHoverExpand(false), 100);
  };

  return (
    <SidebarCtx.Provider
      value={{ collapsed, setCollapsed, overlayOpen, setOverlayOpen }}
    >
      <div className="fp-shell-wrapper">
        <div {...shellAttrs}>
          <aside
            className="fp-sidebar"
            aria-label="Menu principal"
            onMouseEnter={onAsideEnter}
            onMouseLeave={onAsideLeave}
          >
            <Sidebar />
          </aside>

          <div className="fp-overlay" onClick={() => setOverlayOpen(false)} />

          <main className="fp-main">{children}</main>
        </div>
      </div>
    </SidebarCtx.Provider>
  );
}
