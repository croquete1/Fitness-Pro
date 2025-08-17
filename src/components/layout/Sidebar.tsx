"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import Menu from "../sidebar/Menu";

/** ⚠️ Mantivemos os teus ícones por emoji (como já usavas). */
const ICON = {
  dashboard: "📊",
  agenda: "📅",
  notifications: "🔔",
  clients: "👥",
  plans: "📝",
  library: "📚",
  users: "👥",
  approvals: "✅",
  reports: "📈",
  settings: "⚙️",
  health: "🩺",
  logs: "🧾",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { pinned, collapsed, isMobile, open, closeSidebar } = useSidebar();

  // dados do menu — iguais ao que já tinhas (Geral / Personal Trainer / Administração / Sistema)
  const DATA = [
    {
      kind: "group",
      label: "GERAL",
      items: [
        { kind: "item", href: "/dashboard",        label: "Dashboard",    icon: ICON.dashboard, activeExact: true },
        { kind: "item", href: "/dashboard/agenda", label: "Agenda",       icon: ICON.agenda },
        { kind: "item", href: "/dashboard/notifications", label: "Notificações", icon: ICON.notifications },
      ],
    },
    {
      kind: "group",
      label: "PERSONAL TRAINER",
      items: [
        { kind: "item", href: "/dashboard/pt/clients", label: "Clientes",       icon: ICON.clients },
        { kind: "item", href: "/dashboard/pt/plans",   label: "Planos de treino", icon: ICON.plans },
        { kind: "item", href: "/dashboard/pt/library", label: "Biblioteca",     icon: ICON.library },
      ],
    },
    {
      kind: "group",
      label: "ADMINISTRAÇÃO",
      items: [
        { kind: "item", href: "/dashboard/admin/users",  label: "Utilizadores", icon: ICON.users },
        { kind: "item", href: "/dashboard/admin/approvals", label: "Aprovações", icon: ICON.approvals },
        { kind: "item", href: "/dashboard/reports",     label: "Relatórios",   icon: ICON.reports },
        { kind: "item", href: "/dashboard/settings",    label: "Definições",   icon: ICON.settings },
      ],
    },
    {
      kind: "group",
      label: "SISTEMA",
      items: [
        { kind: "item", href: "/dashboard/system/health", label: "Saúde do sistema", icon: ICON.health },
        { kind: "item", href: "/dashboard/system/logs",   label: "Logs de auditoria", icon: ICON.logs },
      ],
    },
  ] as const;

  return (
    <>
      {/* Backdrop (apenas overlay) */}
      {(!pinned || isMobile) && open && (
        <button
          type="button"
          className="fp-sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className="fp-sidebar"
        data-collapsed={collapsed ? "true" : "false"}
        data-pinned={pinned ? "true" : "false"}
        data-overlay={!pinned || isMobile ? "true" : "false"}
        // no overlay, desloca fora quando fechado
        style={
          (!pinned || isMobile)
            ? { transform: open ? "translateX(0)" : "translateX(-100%)" }
            : undefined
        }
      >
        <div className="fp-sidebar-inner">
          {/* a tua navegação original via Menu.tsx */}
          <Menu data={DATA as any} />
        </div>

        <div className="fp-sidebar-footer">
          <a className="fp-nav-item" href="/api/auth/signout">
            <span className="fp-nav-icon">⎋</span>
            <span className="fp-nav-label">Terminar sessão</span>
          </a>
        </div>
      </aside>
    </>
  );
}
