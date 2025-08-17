"use client";

import React, { useMemo } from "react";
import Menu from "./sidebar/Menu";
import { useSidebarState } from "./SidebarWrapper";

// ------- dados do menu (exemplo simples, mantém os teus itens reais) -------
type Role = any;
type Item = { kind: "item"; href: string; label: string; icon?: React.ReactNode; activeExact?: boolean; roles?: Role[]; };
type Group = { kind: "group"; label: string; items: Item[]; roles?: Role[]; };
type Entry = Item | Group;

const ICON = {
  dashboard: "📊",
  reports: "📑",
  settings: "⚙️",
  clients: "🧑‍🤝‍🧑",
  plans: "📘",
  library: "📚",
  approvals: "✅",
  users: "👥",
  health: "🛟",
};

function buildMenu(): Entry[] {
  return [
    { kind: "group", label: "GERAL", items: [
      { kind: "item", href: "/dashboard", label: "Dashboard", icon: ICON.dashboard, activeExact: true },
      { kind: "item", href: "/dashboard/reports", label: "Relatórios", icon: ICON.reports },
      { kind: "item", href: "/dashboard/settings", label: "Definições", icon: ICON.settings },
    ]},
    { kind: "group", label: "PT", items: [
      { kind: "item", href: "/dashboard/pt/clients", label: "Clientes", icon: ICON.clients },
      { kind: "item", href: "/dashboard/pt/plans", label: "Planos", icon: ICON.plans },
      { kind: "item", href: "/dashboard/pt/library", label: "Biblioteca", icon: ICON.library },
    ]},
    { kind: "group", label: "ADMIN", items: [
      { kind: "item", href: "/dashboard/admin/approvals", label: "Aprovações", icon: ICON.approvals },
      { kind: "item", href: "/dashboard/admin/users", label: "Utilizadores", icon: ICON.users },
    ]},
    { kind: "group", label: "SISTEMA", items: [
      { kind: "item", href: "/dashboard/system/health", label: "Saúde do sistema", icon: ICON.health },
    ]},
  ];
}

// ---- constantes visuais
const RAIL_W = 72;
const FULL_W = 260;
const EASE = "cubic-bezier(.22,.61,.36,1)";

export default function Sidebar() {
  const {
    pinned, collapsed, open,
    togglePinned, toggleCollapsed,
    openOverlay, closeOverlay,
  } = useSidebarState();

  const data = useMemo(() => buildMenu(), []);

  // Cabeçalho
  const Header = (
    <div className="fp-sb-head">
      <div className="fp-sb-brand">
        <span className="logo" aria-hidden>💪</span>
        {!collapsed && <strong>Fitness Pro</strong>}
      </div>
      <div className="fp-sb-actions">
        {/* hamburguer */}
        <button
          className="btn icon"
          aria-label="Alternar largura"
          onClick={pinned ? toggleCollapsed : openOverlay}
          title={pinned ? (collapsed ? "Expandir" : "Compactar") : "Abrir menu"}
        >
          {/* simples hamburguer */}
          <span aria-hidden>≡</span>
        </button>
        {/* pin/unpin – sempre visível dentro da sidebar, não no header */}
        <button
          className="btn icon"
          aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
          onClick={togglePinned}
          title={pinned ? "Desafixar" : "Afixar"}
        >
          {pinned ? "📌" : "📍"}
        </button>
      </div>
    </div>
  );

  // -------------------- RENDER --------------------
  // 1) Rail fixo quando não afixada (para hover/tooltip)
  //    Só aparece quando a sidebar não está afixada.
  const Rail = !pinned ? (
    <div
      onMouseEnter={openOverlay}
      style={{
        position: "fixed", left: 0, top: 0, height: "100dvh",
        width: RAIL_W, zIndex: 41,
        display: "grid", gridTemplateRows: "56px 1fr",
        borderRight: "1px solid var(--border)",
        background: "var(--sidebar-bg)",
      }}
    >
      <div className="fp-sb-head" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="fp-sb-brand"><span className="logo" aria-hidden>💪</span></div>
        <div className="fp-sb-actions">
          <button className="btn icon" aria-label="Abrir menu"><span aria-hidden>≡</span></button>
        </div>
      </div>
      {/* os mesmos itens, mas o Menu já mostra os icons/labels conforme CSS */}
      <div className="fp-nav" style={{ padding: 8 }}>
        <Menu data={data} />
      </div>
    </div>
  ) : null;

  // 2) Scrim do overlay (clicável para fechar)
  const Scrim = !pinned && open ? (
    <button
      aria-label="Fechar navegação"
      onClick={closeOverlay}
      style={{
        position: "fixed", inset: 0, background: "color-mix(in oklab, black 30%, transparent)",
        zIndex: 44, border: 0, padding: 0, margin: 0,
      }}
    />
  ) : null;

  // 3) A própria sidebar (drawer em fixed quando !pinned, sticky quando afixada)
  if (!pinned) {
    return (
      <>
        {Rail}
        {Scrim}
        <aside
          className="fp-sidebar"
          onMouseLeave={closeOverlay}
          style={{
            position: "fixed",
            zIndex: 45,
            left: 0,
            top: 0,
            height: "100dvh",
            width: FULL_W,
            borderRight: "1px solid var(--border)",
            transform: open ? "translateX(0)" : `translateX(-${FULL_W - RAIL_W}px)`,
            transition: `transform 360ms ${EASE}`,
            boxShadow: "var(--shadow-1)",
            background: "var(--sidebar-bg)",
            display: "grid",
            gridTemplateRows: "auto 1fr",
          }}
        >
          {Header}
          <div className="fp-nav"><Menu data={data} /></div>
        </aside>
      </>
    );
  }

  // 4) Modo afixado (ocupa a coluna do grid; não mexe no conteúdo)
  return (
    <aside
      className="fp-sidebar"
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "100dvh",
        width: collapsed ? RAIL_W : FULL_W,
        borderRight: "1px solid var(--border)",
        background: "var(--sidebar-bg)",
        transition: `width 360ms ${EASE}`,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        zIndex: 30,
      }}
    >
      {Header}
      <div className="fp-nav"><Menu data={data} /></div>
    </aside>
  );
}
