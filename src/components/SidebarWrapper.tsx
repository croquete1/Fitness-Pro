"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import MobileSidebarController from "./MobileSidebarController";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const open = pinned || hoverOpen;

  const openHover  = useCallback(() => { if (!pinned && !isMobile) setHoverOpen(true); }, [pinned, isMobile]);

  useEffect(() => {
    const compute = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 1024);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isMobile && open) root.setAttribute("data-sidebar", "open");
    else root.removeAttribute("data-sidebar");
    return () => root.removeAttribute("data-sidebar");
  }, [open, isMobile]);

  const hoverTimeout = useRef<number | null>(null);
  const onAsideLeave = () => {
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    hoverTimeout.current = window.setTimeout(() => setHoverOpen(false), 120);
  };

  const shellClass = useMemo(() => `fp-shell ${open ? "" : "is-collapsed"}`, [open]);

  return (
    <>
      {/* strip que abre a sidebar ao aproximar o rato (desktop) */}
      {!isMobile && !pinned && <div className="fp-hover-strip" onMouseEnter={openHover} />}

      <div className={shellClass}>
        <Sidebar
          open={open}
          onClose={() => { setPinned(false); setHoverOpen(false); }}
          onToggle={() => setPinned(p => !p)}
          onMouseLeave={onAsideLeave}
          onMouseEnter={openHover}
        />
        <MobileSidebarController onClose={() => { setPinned(false); setHoverOpen(false); }} />
        <main style={{ width: "100%", height: "100%", overflow: "auto" }}>
          {children}
        </main>
      </div>
    </>
  );
}
