"use client";

import React, { useMemo } from "react";
import Menu from "./sidebar/Menu"; // mantém o teu Menu
import { useSidebarState } from "./SidebarWrapper";

// Tipos mínimos para o Menu
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

// emojis mantidos
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

function buildMenu(): Entry[] {
  return [
    {
      kind: "group",
      label: "Geral",
      items: [
        {
          kind: "item",
          href: "/dashboard",
          label: "Dashboard",
          icon: ICON.dashboard,
          activeExact: true,
        },
        {
          kind: "item",
          href: "/dashboard/reports",
          label: "Relatórios",
          icon: ICON.reports,
        },
        {
          kind: "item",
          href: "/dashboard/settings",
          label: "Definições",
          icon: ICON.settings,
          activeExact: true,
        },
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
      label: "Admin",
      items: [
        { kind: "item", href: "/dashboard/admin/approvals", label: "Aprovações", icon: ICON.approvals },
        { kind: "item", href: "/dashboard/admin/users", label: "Utilizadores", icon: ICON.users },
      ],
    },
    {
      kind: "group",
      label: "Sistema",
      items: [
        { kind: "item", href: "/dashboard/system/health", label: "Saúde do sistema", icon: ICON.health },
      ],
    },
  ];
}

function IconHamburger() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconPin({ pinned }: { pinned: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden
      style={{ transform: pinned ? "rotate(45deg)" : "none", transition: "transform 200ms" }}>
      <path d="M14 3l7 7-3 3 2 2-2 2-2-2-3 3-7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Sidebar() {
  const {
    pinned,
    collapsed,
    overlayOpen,
    togglePinned,
    toggleCollapsed,
    openOverlay,
    closeOverlay,
  } = useSidebarState();

  // quando não está pinned: abre por hover
  const handleEnter = () => {
    if (!pinned) openOverlay();
  };
  const handleLeave = () => {
    if (!pinned) closeOverlay();
  };

  const data = useMemo(() => buildMenu(), []);

  // largura efetiva
  const expandedW = 260;
  const railW = 68;
  const width = pinned ? (collapsed ? railW : expandedW) : overlayOpen ? expandedW : railW;

  const isOverlayMode = !pinned && overlayOpen;

  return (
    <>
      {/* SCRIM (fica atrás do header, mas bloqueia cliques no conteúdo) */}
      {isOverlayMode && (
        <div
          onClick={closeOverlay}
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.28)",
            backdropFilter: "blur(2px)",
            zIndex: 35,
          }}
        />
      )}

      <aside
        className="fp-sidebar"
        data-pinned={pinned ? "true" : "false"}
        data-collapsed={collapsed ? "true" : "false"}
        data-overlay={isOverlayMode ? "true" : "false"}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          // quando overlay, a sidebar é fixa por cima do conteúdo
          position: isOverlayMode ? "fixed" : "sticky",
          left: 0,
          top: 0,
          alignSelf: "start",
          height: "100dvh",
          zIndex: isOverlayMode ? 50 : 30,
          width,
          transition: "width 380ms cubic-bezier(.22,1,.36,1), box-shadow 200ms",
          boxShadow: isOverlayMode ? "0 10px 30px rgba(15,23,42,.22)" : "var(--shadow-1)",
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
        aria-label="Sidebar de navegação"
      >
        {/* Cabeçalho da sidebar */}
        <div
          className="fp-sb-head"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            padding: "10px",
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
                border:
                  "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              💪
            </span>

            {/* título só quando expandida */}
            {width > railW && (
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
              </div>
            )}
          </div>

          {/* Ações (dentro da sidebar, como pediste) */}
          <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
            {/* Botão: hamburger (quando pinned ⇒ alterna rail/expandida; quando não pinned ⇒ abre overlay) */}
            <button
              className="btn icon"
              aria-label="Alternar navegação"
              onClick={() => (pinned ? toggleCollapsed() : openOverlay())}
              title="Menu"
            >
              <IconHamburger />
            </button>

            {/* Botão: fixar/desafixar */}
            <button
              className="btn icon"
              aria-label={pinned ? "Desafixar" : "Afixar"}
              onClick={togglePinned}
              title={pinned ? "Desafixar" : "Afixar"}
            >
              <IconPin pinned={pinned} />
            </button>
          </div>
        </div>

        {/* Navegação */}
        <div style={{ overflow: "auto", padding: 8 }}>
          <Menu data={data} />
        </div>
      </aside>
    </>
  );
}
