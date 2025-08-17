"use client";

import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileSidebarController from "./MobileSidebarController";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const closeSidebar = useCallback(() => setOpen(false), []);
  const toggleSidebar = useCallback(() => setOpen(v => !v), []);

  // detectar mobile
  useEffect(() => {
    const compute = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 1024);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // aplicar/remover atributo no <html> para o off-canvas e overlay
  useEffect(() => {
    const root = document.documentElement;
    if (isMobile && open) root.setAttribute("data-sidebar", "open");
    else root.removeAttribute("data-sidebar");
    return () => root.removeAttribute("data-sidebar");
  }, [open, isMobile]);

  return (
    <div className="fp-shell">
      <Sidebar open={open} onClose={closeSidebar} onToggle={toggleSidebar} />
      <MobileSidebarController onClose={closeSidebar} />
      <main style={{ width: "100%", overflow: "auto" }}>{children}</main>
      {/* overlay é controlado por CSS via html[data-sidebar="open"] .fp-overlay; se quiseres, adiciona <div className="fp-overlay" /> no layout raiz */}
    </div>
  );
}
