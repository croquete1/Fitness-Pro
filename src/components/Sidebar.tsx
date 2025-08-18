"use client";

import React, { useMemo } from "react";
import Menu from "./sidebar/Menu";
import { useSidebar } from "./SidebarProvider";

// Tipagens mínimas compatíveis com o Menu
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

// Ícones (placeholder — mantém os atuais)
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

function buildMenu(): Entry[] {
  return [
    {
      kind: "group",
      label: "Geral",
      items: [
        { kind: "item", href: "/dashboard", label: "Dashboard", icon: ICON.dashboard, activeExact: true },
        { kind: "item", href: "/dashboard/reports", label: "Relatórios", icon: ICON.reports },
        { kind: "item", href: "/dashboard/settings", label: "Definições", icon: ICON.settings, activeExact: true },
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
  // Estado global da sidebar (do SidebarProvider)
  const { pinned, collapsed, togglePinned, toggleCollapsed } = useSidebar();

  // Dados do menu
  const data = useMemo(() => buildMenu(), []);

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
        color: "var(--sidebar-fg)",
        width: collapsed ? 72 : 260,
        transition: "width 420ms cubic-bezier(0.22, 1, 0.36, 1)",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        zIndex: 30,
      }}
      aria-label="Barra lateral"
    >
      {/* Cabeçalho */}
      <div
        className="fp-sb-head"
        style={{
          display: "grid",
          gridTemplateColumns: collapsed ? "1fr" : "1fr auto",
          alignItems: "center",
          gap: 8,
          padding: "10px",
          borderBottom: "1px solid var(--border)",
          minHeight: 56,
        }}
      >
        <div className="fp-sb-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="logo"
            aria-hidden
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
          {!collapsed && (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
              {/* Removido "Navegação" conforme pedido */}
            </div>
          )}
        </div>

        {/* Ações (ficam dentro da sidebar, com hamburguer + pin) */}
        <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
          <button
            type="button"
            className="btn icon"
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={collapsed ? "Expandir" : "Recolher"}
            onClick={toggleCollapsed}
          >
            {/* Hamburguer visível mesmo em rail */}
            <span aria-hidden>☰</span>
          </button>

          {/* Botão de fixar/desafixar */}
          <button
            type="button"
            className="btn icon"
            aria-pressed={pinned}
            aria-label={pinned ? "Desafixar sidebar" : "Fixar sidebar"}
            title={pinned ? "Desafixar" : "Fixar"}
            onClick={togglePinned}
          >
            <span aria-hidden>{pinned ? "📌" : "📍"}</span>
          </button>
        </div>
      </div>

      {/* Navegação */}
      <div style={{ overflow: "auto", padding: 8 }}>
        <Menu data={data} />
      </div>
    </aside>
  );
}
