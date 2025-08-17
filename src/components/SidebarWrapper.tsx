"use client";

import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [pinned, setPinned] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // carregar preferências
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = localStorage.getItem("fp_pinned");
    const c = localStorage.getItem("fp_collapsed");
    setPinned(p !== "false");
    setCollapsed(c === "true");
  }, []);

  // media query para mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // guardar preferências
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("fp_pinned", String(pinned));
    localStorage.setItem("fp_collapsed", String(collapsed));
  }, [pinned, collapsed]);

  const overlay = !pinned || isMobile;

  // hover-peek quando pinada & colapsada
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.querySelector(".fp-hover-hotspot");
    if (!el) return;
    const onEnter = () => {
      if (pinned && collapsed && !overlay) {
        document.documentElement.setAttribute("data-sidebar", "open");
      }
    };
    const onLeave = () => {
      if (pinned && collapsed && !overlay) {
        document.documentElement.removeAttribute("data-sidebar");
      }
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [pinned, collapsed, overlay]);

  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);
  const openOverlay = useCallback(() => setOpen(true), []);
  const closeOverlay = useCallback(() => setOpen(false), []);

  return (
    <div
      className="fp-shell"
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={pinned && collapsed ? "true" : "false"}
      data-overlay={overlay ? "true" : "false"}
      data-open={open ? "true" : "false"}
    >
      {/* HEADER */}
      <header className="fp-header">
        {/* Botão hamburger (abre overlay em mobile/solta; colapsa/expande quando pinada) */}
        <button
          type="button"
          className="btn-ghost pill"
          onClick={overlay ? (open ? closeOverlay : openOverlay) : toggleCollapse}
          aria-label={overlay ? (open ? "Fechar menu" : "Abrir menu") : (collapsed ? "Expandir sidebar" : "Recolher sidebar")}
        >
          <span aria-hidden="true">{overlay ? (open ? "✖" : "☰") : (collapsed ? "▤" : "▮▮")}</span>
        </button>

        {/* Espaço à direita para ações (placeholder) */}
        <div style={{ marginLeft: "auto" }} />
      </header>

      {/* HOTSPOT para hover-peek quando pinada+colapsada */}
      <div className="fp-hover-hotspot" aria-hidden="true" />

      {/* OVERLAY */}
      <div className="fp-overlay" onClick={closeOverlay} />

      {/* SIDEBAR */}
      <aside className="fp-sidebar" role="complementary" aria-label="Sidebar de navegação" onClick={overlay ? closeOverlay : undefined}>
        <Sidebar />
      </aside>

      {/* CONTEÚDO */}
      <main className="fp-content">{children}</main>
    </div>
  );
}
