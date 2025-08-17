"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import Menu from "./sidebar/Menu";
import useSidebarState from "./SidebarWrapper";

/** Larguras consistentes com o layout */
const RAIL_W = 64;      // rail fixo (só ícones)
const PANEL_W = 260;    // painel expandido
const ANIM_MS = 420;    // animação mais lenta

// Ícones (mantidos)
const ICON = {
  dashboard: "📊",
  clients: "🧑‍🤝‍🧑",
  plans: "📘",
  library: "📚",
  approvals: "✅",
  users: "👥",
  reports: "📈",
  settings: "⚙️",
  health: "🛟",
};

type Role = any;
type Item = {
  kind: "item";
  href: string;
  label: string;
  icon?: React.ReactNode;
  roles?: Role[];
  activeExact?: boolean;
};
type Group = {
  kind: "group";
  label: string;
  icon?: React.ReactNode;
  roles?: Role[];
  items: Item[];
};
type Entry = Item | Group;

function buildMenu(): Entry[] {
  return [
    {
      kind: "group",
      label: "GERAL",
      items: [
        { kind: "item", href: "/dashboard", label: "Dashboard", icon: ICON.dashboard, activeExact: true },
        { kind: "item", href: "/dashboard/reports", label: "Relatórios", icon: ICON.reports },
        { kind: "item", href: "/dashboard/settings", label: "Definições", icon: ICON.settings },
      ],
    },
    {
      kind: "group",
      label: "PT",
      items: [
        { kind: "item", href: "/dashboard/pt/clients", label: "Clientes", icon: ICON.clients },
        { kind: "item", href: "/dashboard/pt/plans", label: "Planos", icon: ICON.plans },
        { kind: "item", href: "/dashboard/pt/library", label: "Biblioteca", icon: ICON.library },
      ],
    },
    {
      kind: "group",
      label: "ADMIN",
      items: [
        { kind: "item", href: "/dashboard/admin/approvals", label: "Aprovações", icon: ICON.approvals },
        { kind: "item", href: "/dashboard/admin/users", label: "Utilizadores", icon: ICON.users },
      ],
    },
    {
      kind: "group",
      label: "SISTEMA",
      items: [{ kind: "item", href: "/dashboard/system/health", label: "Saúde do sistema", icon: ICON.health }],
    },
  ];
}

export default function Sidebar() {
  const {
    pinned,
    collapsed,
    overlayOpen,
    setOverlayOpen,
    togglePinned,
    toggleCollapsed,
    closeOverlay,
  } = useSidebarState();

  const data = useMemo(() => buildMenu(), []);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // rail sempre presente
  const railWidth = pinned ? (collapsed ? RAIL_W : PANEL_W) : RAIL_W;

  // “mini” quando desafixada OU recolhida
  const isMini = !pinned || (pinned && collapsed);

  const onMouseEnterRail = () => {
    if (!pinned) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setOverlayOpen(true);
    }
  };
  const onMouseLeaveRail = () => {
    if (!pinned) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => setOverlayOpen(false), 180);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  // injecção CSS (SSR safe)
  const [injectCss, setInjectCss] = useState(false);
  useEffect(() => setInjectCss(true), []);

  return (
    <>
      {/* RAIL */}
      <aside
        className="fp-sidebar"
        data-pinned={pinned ? "true" : "false"}
        data-mini={isMini ? "true" : "false"}
        data-overlay={overlayOpen ? "true" : "false"}
        style={{
          position: "sticky",
          top: 0,
          alignSelf: "start",
          height: "100dvh",
          borderRight: "1px solid var(--border)",
          background: "var(--sidebar-bg)",
          width: railWidth,
          transition: `width ${ANIM_MS}ms cubic-bezier(.22,.61,.36,1)`,
          display: "grid",
          gridTemplateRows: "auto 1fr",
          zIndex: 30,
          // corta quaisquer “balões”/pseudo-elements que saiam do rail
          overflow: "hidden",
        }}
        aria-label="Sidebar"
        onMouseEnter={onMouseEnterRail}
        onMouseLeave={onMouseLeaveRail}
      >
        {/* cabeçalho */}
        <div
          className="fp-sb-head"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            padding: 10,
            gap: 8,
            borderBottom: "1px solid var(--border)",
            minHeight: 56,
          }}
        >
          <div className="fp-sb-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden
              className="logo"
              style={{
                width: 28,
                height: 28,
                borderRadius: 10,
                background:
                  "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
                border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              💪
            </span>
            {railWidth > RAIL_W && (
              <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Fitness Pro</div>
            )}
          </div>

          <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
            {/* recolher/expandir */}
            <button
              className="btn icon"
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
              title={collapsed ? "Expandir" : "Recolher"}
              onClick={() => {
                if (!pinned) {
                  setOverlayOpen(true);
                  return;
                }
                toggleCollapsed();
              }}
            >
              <span aria-hidden>≡</span>
            </button>
            {/* afixar/desafixar */}
            <button
              className="btn icon"
              aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
              title={pinned ? "Desafixar" : "Afixar"}
              onClick={togglePinned}
            >
              <span aria-hidden>{pinned ? "📌" : "📍"}</span>
            </button>
          </div>
        </div>

        {/* CSS para modo MINI */}
        {injectCss && (
          <style jsx global>{`
            /* no modo mini escondemos labels e headings de grupo */
            .fp-sidebar[data-mini="true"] .nav-label { display: none !important; }
            .fp-sidebar[data-mini="true"] .nav-item { grid-template-columns: 24px !important; }
            .fp-sidebar[data-mini="true"] .nav-section { display: none !important; }
          `}</style>
        )}

        {/* navegação */}
        <div style={{ overflow: "auto", padding: 8 }}>
          <Menu data={data as any} />
        </div>
      </aside>

      {/* SCRIM + FLYOUT quando DESAFIXADA */}
      {!pinned && overlayOpen && (
        <>
          <div
            onClick={closeOverlay}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2,6,23,.35)",
              backdropFilter: "blur(1px)",
              zIndex: 59,
            }}
          />
          <div
            onMouseEnter={() => {
              if (hoverTimer.current) clearTimeout(hoverTimer.current);
            }}
            onMouseLeave={() => {
              if (hoverTimer.current) clearTimeout(hoverTimer.current);
              hoverTimer.current = setTimeout(() => setOverlayOpen(false), 180);
            }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              height: "100dvh",
              width: PANEL_W,
              background: "var(--sidebar-bg)",
              color: "var(--sidebar-fg)",
              borderRight: "1px solid var(--border)",
              boxShadow: "0 10px 30px rgba(15,23,42,.15)",
              display: "grid",
              gridTemplateRows: "auto 1fr",
              zIndex: 60,
              animation: `fp-slide-in ${ANIM_MS}ms cubic-bezier(.22,.61,.36,1)`,
            }}
          >
            <div
              className="fp-sb-head"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                padding: 10,
                gap: 8,
                borderBottom: "1px solid var(--border)",
                minHeight: 56,
              }}
            >
              <div className="fp-sb-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  aria-hidden
                  className="logo"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    background:
                      "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
                    border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  💪
                </span>
                <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Fitness Pro</div>
              </div>

              <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
                <button className="btn icon" aria-label="Fechar menu" title="Fechar" onClick={closeOverlay}>
                  ✕
                </button>
                <button className="btn icon" aria-label="Afixar sidebar" title="Afixar" onClick={togglePinned}>
                  📌
                </button>
              </div>
            </div>

            <div style={{ overflow: "auto", padding: 8 }}>
              <Menu data={data as any} />
            </div>
          </div>

          <style jsx global>{`
            @keyframes fp-slide-in {
              from { transform: translateX(-14px); opacity: .0; }
              to   { transform: translateX(0);      opacity: 1;  }
            }
          `}</style>
        </>
      )}
    </>
  );
}
