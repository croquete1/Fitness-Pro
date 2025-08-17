"use client";

import React, { useMemo } from "react";
import Menu from "./sidebar/Menu";
import useSidebarState from "./SidebarWrapper";

// Tipagens mínimas (compatíveis com Menu.tsx)
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

// Ícones (iguais ao que combinámos)
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
  // Usa o estado global da sidebar (evita o erro de var não utilizada)
  const { pinned, collapsed } = useSidebarState();

  // Dados do menu
  const data = useMemo(() => buildMenu(), []);

  return (
    <aside
      className="fp-sidebar"
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      aria-label="Sidebar de navegação"
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "100dvh",
        borderRight: "1px solid var(--border)",
        background: "var(--bg)",
        width: collapsed ? 72 : 260,
        transition: "width 200ms ease",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        zIndex: 30,
      }}
    >
      {/* Cabeçalho compacto (sem 'menu' extra) */}
      <div
        style={{
          padding: "10px 10px 8px 10px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          minHeight: 56,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            background:
              "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.05))",
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
        {!collapsed && (
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Navegação
            </div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <div style={{ overflow: "auto", padding: 8 }}>
        <Menu data={data} />
      </div>
    </aside>
  );
}
