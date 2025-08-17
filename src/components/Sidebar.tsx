"use client";

import * as React from "react";
import Menu from "./sidebar/Menu";
import { useSidebarState } from "./SidebarWrapper";

// Larguras e transições
const RAIL_W = 64;
const PANEL_W = 264;
const TRANS = "480ms cubic-bezier(0.22, 1, 0.36, 1)";

// Tipos mínimos
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

// Ícones simples (mantém como estavas a usar)
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

export default function Sidebar() {
  const {
    pinned,
    collapsed,
    togglePinned,
    toggleCollapsed,
    overlayOpen,
    openOverlay,
    closeOverlay,
  } = useSidebarState();

  const data = React.useMemo(() => buildMenu(), []);

  // Hover só controla overlay quando NÃO está afixada
  const [hovered, setHovered] = React.useState(false);
  const handleEnter = () => {
    setHovered(true);
    if (!pinned) openOverlay();
  };
  const handleLeave = () => {
    setHovered(false);
    if (!pinned) closeOverlay();
  };

  const asideWidth = pinned ? (collapsed ? RAIL_W : PANEL_W) : RAIL_W;

  // Mostrar painel “flyout” quando não afixada e em hover
  const flyoutVisible = !pinned && (hovered || overlayOpen);

  // Mostrar conteúdo expandido embutido quando afixada e não colapsada
  const isExpandedInline = pinned && !collapsed;

  // Mostrar botão de “pin” no rail apenas em hover (para não poluir quando compacto)
  const showPin = collapsed || !pinned ? hovered : true;

  return (
    <aside
      className="fp-sidebar"
      aria-label="Sidebar"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "100dvh",
        width: asideWidth,
        background: "var(--sidebar-bg)",
        color: "var(--sidebar-fg)",
        borderRight: "1px solid var(--border)",
        transition: `width ${TRANS}`,
        zIndex: 30, // o header fica acima (z-index maior)
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "visible",
      }}
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
          minHeight: 64,
          position: "relative",
        }}
      >
        <div className="fp-sb-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            className="logo"
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              background: "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
              border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            💪
          </span>

          {/* Só mostra o nome quando expandida e afixada */}
          {isExpandedInline && (
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Fitness Pro</div>
          )}
        </div>

        {/* Ações: hamburguer (colapsar) e pin (afixar) */}
        <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
          {/* Hamburguer só faz sentido quando afixada */}
          {pinned && (
            <button
              className="btn icon"
              type="button"
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
              onClick={toggleCollapsed}
              title={collapsed ? "Expandir" : "Recolher"}
              style={{ borderRadius: 10, padding: 8, lineHeight: 0 }}
            >
              <span style={{ fontSize: 18 }}>≡</span>
            </button>
          )}

          {/* Pin: em rail compacto, aparece só no hover */}
          <button
            className="btn icon"
            type="button"
            aria-label={pinned ? "Desafixar barra" : "Afixar barra"}
            onClick={togglePinned}
            title={pinned ? "Desafixar" : "Afixar"}
            style={{
              borderRadius: 10,
              padding: 8,
              lineHeight: 0,
              opacity: showPin ? 1 : 0,
              pointerEvents: showPin ? "auto" : "none",
              transition: `opacity 180ms ease`,
            }}
          >
            {pinned ? "📌" : "📍"}
          </button>
        </div>
      </div>

      {/* Conteúdo inline quando está afixada e expandida */}
      {isExpandedInline ? (
        <div style={{ overflow: "auto", padding: 8 }}>
          <Menu data={data} />
        </div>
      ) : (
        // Rail compacto (apenas ocupa altura; os tooltips vêm do title do <Menu> no flyout)
        <div style={{ overflow: "hidden auto", padding: "8px 6px" }}>
          {/* Mantemos vazio para não empurrar o layout; a navegação completa aparece no flyout */}
        </div>
      )}

      {/* Flyout quando NÃO está afixada: abre sobreposto e não mexe na largura do conteúdo */}
      <div
        aria-hidden={!flyoutVisible}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: PANEL_W,
          height: "100%",
          borderRight: "1px solid var(--border)",
          background: "var(--sidebar-bg)",
          boxShadow: "var(--shadow-1)",
          transform: flyoutVisible ? "translateX(0)" : `translateX(-${PANEL_W}px)`,
          transition: `transform ${TRANS}`,
          zIndex: 35,
          display: "grid",
          gridTemplateRows: "64px 1fr",
          pointerEvents: flyoutVisible ? "auto" : "none",
        }}
        onMouseEnter={() => !pinned && openOverlay()}
        onMouseLeave={() => !pinned && closeOverlay()}
      >
        {/* “Tampo” para alinhar com o head do rail */}
        <div style={{ borderBottom: "1px solid var(--border)" }} />
        <div style={{ overflow: "auto", padding: 8 }}>
          <Menu data={data} />
        </div>
      </div>
    </aside>
  );
}
