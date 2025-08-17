"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import Menu from "./sidebar/Menu";
import useSidebarState from "./SidebarWrapper";

/** Dimensões e animação */
const RAIL_W = 64;
const PANEL_W = 260;
const ANIM_MS = 520; // animação mais lenta/suave
const EASE = "cubic-bezier(.22,.8,.2,1)";

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

/** Ícone hambúrguer em SVG (alinhamento/espessura perfeitos) */
const IconBurger = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path d="M3 7h18M3 12h18M3 17h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

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

  const railWidth = pinned ? (collapsed ? RAIL_W : PANEL_W) : RAIL_W;
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

  useEffect(() => () => hoverTimer.current && clearTimeout(hoverTimer.current), []);

  const [injectCss, setInjectCss] = useState(false);
  useEffect(() => setInjectCss(true), []);

  return (
    <>
      {/* RAIL / PAINEL */}
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
          transition: `width ${ANIM_MS}ms ${EASE}`,
          display: "grid",
          gridTemplateRows: "auto 1fr",
          zIndex: 30,
          overflow: "hidden",
        }}
        aria-label="Sidebar"
        onMouseEnter={onMouseEnterRail}
        onMouseLeave={onMouseLeaveRail}
      >
        {/* Cabeçalho */}
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
                background: "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
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
            {/* Recolher/expandir */}
            <button
              className="btn icon sb-icon"
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
              <IconBurger />
            </button>
            {/* Afixar/desafixar */}
            <button
              className="btn icon sb-icon"
              aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
              title={pinned ? "Desafixar" : "Afixar"}
              onClick={togglePinned}
            >
              <span aria-hidden>{pinned ? "📌" : "📍"}</span>
            </button>
          </div>
        </div>

        {/* Transições suaves para labels/itens; esconder headings no modo mini */}
        {injectCss && (
          <style jsx global>{`
            .fp-sidebar .nav-item,
            .fp-sidebar .nav-label {
              transition: opacity ${ANIM_MS}ms ${EASE}, transform ${ANIM_MS}ms ${EASE};
            }
            .fp-sidebar[data-mini="true"] .nav-label {
              opacity: 0;
              transform: translateX(-6px);
              pointer-events: none;
            }
            .fp-sidebar[data-mini="true"] .nav-item { grid-template-columns: 24px !important; }
            .fp-sidebar[data-mini="true"] .nav-section { display: none !important; }

            /* Botão/ícone bem centrado e consistente */
            .fp-sidebar .sb-icon {
              width: 36px;
              height: 36px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 10px;
            }
            .fp-sidebar .sb-icon:hover { background: var(--sidebar-hover); }
          `}</style>
        )}

        {/* Navegação */}
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
              animation: `fp-fade-in ${ANIM_MS}ms ${EASE}`,
            }}
          />
          <div
            onMouseEnter={() => hoverTimer.current && clearTimeout(hoverTimer.current)}
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
              animation: `fp-slide-in ${ANIM_MS}ms ${EASE}`,
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
                    background: "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
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
                <button className="btn icon sb-icon" aria-label="Fechar menu" title="Fechar" onClick={closeOverlay}>
                  ✕
                </button>
                <button className="btn icon sb-icon" aria-label="Afixar sidebar" title="Afixar" onClick={togglePinned}>
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
              from { transform: translateX(-16px); opacity: .0; }
              to   { transform: translateX(0);      opacity: 1;  }
            }
            @keyframes fp-fade-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>
        </>
      )}
    </>
  );
}
