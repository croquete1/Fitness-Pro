"use client";

import React from "react";
import Menu from "./sidebar/Menu";
import { useSidebarState } from "./SidebarWrapper";

// --- Constantes visuais (mantém simples e coesas) ---
const RAIL_W = 64;     // largura do rail (compactada)
const PANEL_W = 260;   // largura expandida
const TRANS = "380ms cubic-bezier(0.22, 1, 0.36, 1)";

// Tipagens mínimas compatíveis com o teu Menu.tsx
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

// Ícones simples (podes trocar pelos teus)
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
    openOverlay,
    closeOverlay,
  } = useSidebarState();

  const data = React.useMemo(() => buildMenu(), []);

  // Apenas para mostrar/ocultar pin quando rail está compacto
  const [hovered, setHovered] = React.useState(false);
  const showPin = pinned ? !collapsed || hovered : hovered; // rail: só em hover

  // Abre o painel quando não está afixada (overlay) ao passar o rato
  const handleEnter = () => {
    setHovered(true);
    if (!pinned) openOverlay();
  };
  const handleLeave = () => {
    setHovered(false);
    if (!pinned) closeOverlay();
  };

  // Largura física do aside (NÃO cresce no overlay; mantém RAIL_W para não “comer” header/conteúdo)
  const asideWidth = pinned ? (collapsed ? RAIL_W : PANEL_W) : RAIL_W;

  // Painel “flyout”: só visível se (pinned && !collapsed) OU (overlay aberto ao passar o rato)
  const flyoutVisible = pinned ? !collapsed : hovered;

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
        zIndex: 30, // header tem > 30, portanto continua clicável
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "visible",
      }}
    >
      {/* Cabeçalho do rail */}
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

          {/* Quando o rail está fechado e pinned, não mostramos texto aqui */}
          {pinned && !collapsed && (
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Fitness Pro</div>
          )}
        </div>

        {/* Ações (mostrar pin só em hover quando rail compacto) */}
        <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
          {/* Botão de colapsar/expandir apenas quando pinned */}
          {pinned && (
            <button
              className="btn icon"
              type="button"
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
              onClick={() => toggleCollapsed()}
              title={collapsed ? "Expandir" : "Recolher"}
              style={{
                borderRadius: 10,
                padding: 8,
                lineHeight: 0,
              }}
            >
              {/* hamburguer */}
              <span style={{ fontSize: 18 }}>≡</span>
            </button>
          )}

          {/* Pin / Unpin: só aparece em hover quando rail está compacto */}
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

      {/* Rail (apenas ícones) - mantém o espaçamento coerente com os grupos */}
      <div
        className="fp-rail"
        style={{
          padding: "8px 6px",
          overflow: "hidden auto",
        }}
      >
        {/* Espaços que simulam as secções quando está compacto,
            para que a posição vertical dos ícones coincida com a versão expandida */}
        <div style={{ height: 4 }} />
        <div style={{ height: 14 }} />
        <div style={{ height: 14 }} />
        <div style={{ height: 14 }} />
        <div style={{ height: 14 }} />
        <div style={{ height: 14 }} />
      </div>

      {/* Painel flyout (não empurra o layout) */}
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
        // Impede que um clique fora imediatamente feche durante hover rápido
        onMouseEnter={() => !pinned && openOverlay()}
        onMouseLeave={() => !pinned && closeOverlay()}
      >
        {/* Head “fantasma” para alinhar com o rail */}
        <div
          style={{
            borderBottom: "1px solid var(--border)",
          }}
        />
        <div style={{ overflow: "auto", padding: 8 }}>
          <Menu data={data} />
        </div>
      </div>
    </aside>
  );
}
