"use client";

import React, { useMemo } from "react";
import Menu from "./sidebar/Menu";
// 👇 usa o named import do hook (NÃO o default)
import { useSidebarState } from "./SidebarWrapper";

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

const ICON = {
  dashboard: "📊",
  clients: "🧑‍🤝‍🧑",
  workouts: "💪",
  plans: "📘",
  library: "📚",
  approvals: "✅",
  users: "👥",
  reports: "📈",
  settings: "⚙️",
  system: "🖥️",
  health: "🛟",
};

function buildMenu(_role?: Role): Entry[] {
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
      items: [{ kind: "item", href: "/dashboard/system/health", label: "Saúde do sistema", icon: ICON.health }],
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
    closeOverlay,
  } = useSidebarState();

  // menu estável (sem deps desnecessárias)
  const data = useMemo(() => buildMenu(undefined), []);

  return (
    <aside
      className="fp-sidebar"
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "100dvh",
        borderRight: "1px solid var(--border)",
        background: "var(--sidebar-bg)",
        width: collapsed ? 72 : 260,
        transition: "width 200ms ease",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        zIndex: 30,
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
          {!collapsed && (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Navegação
              </div>
            </div>
          )}
        </div>

        {/* Botões: fixar e encolher/expandir */}
        <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
          <button
            type="button"
            className="btn icon"
            onClick={togglePinned}
            title={pinned ? "Desafixar" : "Fixar"}
            aria-pressed={pinned}
          >
            📌
          </button>
          <button
            type="button"
            className="btn icon"
            onClick={toggleCollapsed}
            title={collapsed ? "Expandir" : "Encolher"}
            aria-pressed={collapsed}
          >
            {collapsed ? "⟩" : "⟨"}
          </button>
        </div>
      </div>

      {/* Navegação */}
      <div style={{ overflow: "auto", padding: 8 }}>
        <Menu data={data} />
      </div>

      {/* Overlay para modo “drawer” em mobile quando não fixo */}
      {overlayOpen && !pinned && (
        <div
          onClick={closeOverlay}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,.45)",
            backdropFilter: "blur(2px)",
            zIndex: 20,
          }}
        />
      )}
    </aside>
  );
}
