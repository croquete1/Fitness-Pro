"use client";

import React, { useMemo } from "react";
import Menu from "./sidebar/Menu";
import useSidebarState from "./SidebarWrapper";

// Tipagens mínimas (compatíveis com o teu Menu.tsx)
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

// Mantém os teus ícones/labels (podes trocar por SVGs se quiseres)
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
      items: [{ kind: "item", href: "/dashboard/system/health", label: "Saúde do sistema", icon: ICON.health }],
    },
  ];
}

export default function Sidebar() {
  const { pinned, collapsed, togglePinned, toggleCollapsed, overlayOpen, closeOverlay } = useSidebarState();

  // Dados do menu – estável
  const data = useMemo(() => buildMenu(), []);

  return (
    <>
      {/* Backdrop do overlay em mobile */}
      {overlayOpen && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: "color-mix(in oklab, var(--muted) 30%, transparent)",
            backdropFilter: "blur(2px)",
            zIndex: 49,
          }}
          onClick={closeOverlay}
        />
      )}

      <aside
        id="app-sidebar"
        className="fp-sidebar"
        data-pinned={pinned ? "true" : "false"}
        data-collapsed={collapsed ? "true" : "false"}
        style={{
          position: "sticky",
          top: 0,
          alignSelf: "start",
          height: "100dvh",
          borderRight: "1px solid var(--border)",
          background: "var(--bg)",
          width: collapsed ? 72 : 256,
          transition: "width 200ms ease",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          zIndex: 50,
        }}
        aria-label="Sidebar de navegação"
      >
        {/* Cabeçalho da sidebar */}
        <div
          style={{
            padding: "10px 10px 8px 10px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            minHeight: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: 10,
                background:
                  "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.05))",
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

          {/* Botões: encolher/expandir + fixar/desafixar */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="btn ghost"
              onClick={toggleCollapsed}
              title={collapsed ? "Expandir sidebar" : "Encolher sidebar"}
              aria-label={collapsed ? "Expandir sidebar" : "Encolher sidebar"}
            >
              {collapsed ? "»" : "«"}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={togglePinned}
              title={pinned ? "Desafixar" : "Afixar"}
              aria-pressed={pinned}
              aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
            >
              📌
            </button>
          </div>
        </div>

        {/* Lista de navegação (os teus ícones e labels) */}
        <div style={{ overflow: "auto", padding: 8 }}>
          <Menu data={data} />
        </div>
      </aside>
    </>
  );
}
