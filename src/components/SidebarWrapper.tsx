"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

type SidebarCtx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  pinned: boolean; // desktop: true = sidebar fixa (não overlay)
  setPinned: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);
export const useSidebar = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSidebar deve ser usado dentro de <SidebarWrapper/>");
  return v;
};

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hovering, setHovering] = useState(false);

  // detectar mobile para forçar overlay
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Em mobile a sidebar nunca é "pinned"
  useEffect(() => {
    if (isMobile) setPinned(false);
  }, [isMobile]);

  // quando colapsada e afixada, abrir por hover
  const expandOnHover = pinned && collapsed;

  const ctxValue = useMemo(
    () => ({ collapsed, setCollapsed, pinned, setPinned }),
    [collapsed, pinned]
  );

  const shellAttrs: React.HTMLAttributes<HTMLDivElement> = {
    className: "fp-shell",
    "data-collapsed": (pinned && collapsed) ? "true" : "false",
    "data-pinned": pinned ? "true" : "false",
    "data-overlay": (!pinned || isMobile) ? "true" : "false",
  };

  return (
    <Ctx.Provider value={ctxValue}>
      <div {...shellAttrs}>
        <aside
          className="fp-sidebar"
          onMouseEnter={() => expandOnHover && setHovering(true)}
          onMouseLeave={() => expandOnHover && setHovering(false)}
          data-expanded={expandOnHover && hovering ? "true" : "false"}
        >
          <Sidebar />
        </aside>

        <main className="fp-main">
          {/* Header fica dentro do main para alinhar com o conteúdo */}
          <header className="fp-header">
            <div className="fp-header-inner">
              <div />
              <input
                className="search"
                placeholder="Pesquisar cliente por nome ou email..."
                aria-label="Pesquisar"
              />
              <button className="btn ghost" onClick={() => (window.location.href = "/api/auth/signout?callbackUrl=/login")}>
                Terminar sessão
              </button>
            </div>
          </header>

          <div className="fp-content">{children}</div>
        </main>

        {/* overlay (só em mobile/overlay) */}
        <div
          className="fp-overlay"
          onClick={() => !pinned && setCollapsed(false)}
        />
      </div>
    </Ctx.Provider>
  );
}
