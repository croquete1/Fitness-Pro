"use client";

import React from "react";
import Menu from "./sidebar/Menu";
import { useSidebarState } from "./SidebarWrapper";

// ⚠️ Mantive os rótulos, rotas e emojis como já tinhas.
// Se alguma rota divergir no teu projeto, ajusta só o `href`.

const NAV: any[] = [
  {
    kind: "group",
    label: "GERAL",
    items: [
      { kind: "item", href: "/dashboard", label: "Dashboard", icon: "📊", activeExact: false },
      { kind: "item", href: "/dashboard/schedule", label: "Agenda", icon: "📅" },
      { kind: "item", href: "/dashboard/notifications", label: "Notificações", icon: "🔔" },
    ],
  },
  {
    kind: "group",
    label: "PERSONAL TRAINER",
    items: [
      { kind: "item", href: "/dashboard/pt/clients", label: "Clientes", icon: "🧑‍🤝‍🧑" },
      { kind: "item", href: "/dashboard/pt/plans", label: "Planos de treino", icon: "📘" },
      { kind: "item", href: "/dashboard/pt/library", label: "Biblioteca", icon: "📚" },
    ],
  },
  {
    kind: "group",
    label: "ADMINISTRAÇÃO",
    items: [
      { kind: "item", href: "/dashboard/admin/users", label: "Utilizadores", icon: "👥" },
      { kind: "item", href: "/dashboard/admin/approvals", label: "Aprovações", icon: "✅" },
      { kind: "item", href: "/dashboard/reports", label: "Relatórios", icon: "📈" },
      { kind: "item", href: "/dashboard/settings", label: "Definições", icon: "⚙️" },
    ],
  },
  {
    kind: "group",
    label: "SISTEMA",
    items: [
      { kind: "item", href: "/dashboard/system/health", label: "Saúde do sistema", icon: "🩺" },
      { kind: "item", href: "/dashboard/system/logs", label: "Logs de auditoria", icon: "🧾" },
    ],
  },
];

export default function Sidebar() {
  const { pinned, collapsed } = useSidebarState();

  return (
    <aside
      className="fp-sidebar"
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      aria-label="Barra lateral"
    >
      <Menu data={NAV} />
    </aside>
  );
}
