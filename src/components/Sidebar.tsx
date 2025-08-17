"use client";

import React, { useMemo, useState } from "react";
import Menu from "./sidebar/Menu";
import useSidebarState from "./SidebarWrapper";

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
  const { pinned, collapsed, togglePinned } = useSidebarState();
  const [peek, setPeek] = useState(false);

  // Dados do menu (estáveis)
  const data = useMemo(() => buildMenu(), []);

  const canPeek = collapsed && !pinned;

  return (
    <aside
      className="fp-sidebar"
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      data-peek={peek ? "true" : "false"}
      onMouseEnter={() => canPeek && setPeek(true)}
      onMouseLeave={() => canPeek && setPeek(false)}
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "100dvh",
        zIndex: 30,
        display: "grid",
        gridTemplateRows: "auto 1fr",
      }}
      aria-label="Sidebar de navegação"
    >
      {/* Cabeçalho */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <span className="logo" aria-hidden>💪</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
            <div className="text-muted" style={{ fontSize: 12 }}>Navegação</div>
          </div>
        </div>

        <div className="fp-sb-actions">
          {/* Afixar/Desafixar */}
          <button
            type="button"
            className="btn icon"
            onClick={togglePinned}
            aria-pressed={pinned}
            aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
            title={pinned ? "Desafixar" : "Afixar"}
          >
            {pinned ? "📌" : "📍"}
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
