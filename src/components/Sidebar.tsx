"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useSidebarState } from "./SidebarWrapper";

/** Ícones em emoji – versão que acordámos */
const ICONS = {
  dashboard: "📊",
  calendar: "📅",
  bell: "🔔",
  profile: "👤",
  reports: "📈",
  settings: "⚙️",

  clients: "🧑‍🤝‍🧑",
  plans: "📘",
  library: "📚",

  users: "👥",
  approvals: "✅",

  health: "🩺",
  logs: "🧾",
} as const;

type Item = { label: string; href: string; icon: keyof typeof ICONS };
type Group = { title: string; items: Item[] };

const NAV: { title: string; groups: Group[] }[] = [
  {
    title: "Geral",
    groups: [
      { title: "", items: [
        { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { label: "Agenda", href: "/dashboard/sessions", icon: "calendar" },
        { label: "Notificações", href: "/dashboard/notifications", icon: "bell" },
      ]},
    ],
  },
  {
    title: "Personal trainer",
    groups: [
      { title: "", items: [
        { label: "Clientes", href: "/dashboard/pt/clients", icon: "clients" },
        { label: "Planos de treino", href: "/dashboard/pt/plans", icon: "plans" },
        { label: "Biblioteca", href: "/dashboard/pt/library", icon: "library" },
      ]},
    ],
  },
  {
    title: "Administração",
    groups: [
      { title: "", items: [{ label: "Utilizadores", href: "/dashboard/admin/users", icon: "users" }] },
      { title: "", items: [{ label: "Aprovações", href: "/dashboard/admin/approvals", icon: "approvals" }] },
      { title: "", items: [{ label: "Relatórios", href: "/dashboard/reports", icon: "reports" }] },
      { title: "", items: [{ label: "Definições", href: "/dashboard/settings", icon: "settings" }] },
    ],
  },
  {
    title: "Sistema",
    groups: [
      { title: "", items: [{ label: "Saúde do sistema", href: "/dashboard/system/health", icon: "health" }] },
      { title: "", items: [{ label: "Logs de auditoria", href: "/dashboard/system/logs", icon: "logs" }] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, overlayOpen, setOverlayOpen } = useSidebarState();

  const closeMobile = () => setOverlayOpen(false);

  return (
    <nav className="fp-nav">
      {/* Controlo de recolher/expandir (permanece funcional) */}
      <div className="fp-nav-top" style={{ display: "flex", gap: 8, padding: "4px 6px 10px" }}>
        <button
          type="button"
          className="fp-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? "➡️" : "⬅️"} <span className="fp-label">Recolher</span>
        </button>
        <button
          type="button"
          className="fp-btn"
          onClick={() => setOverlayOpen(!overlayOpen)}
          aria-label={overlayOpen ? "Fechar menu" : "Abrir menu"}
          title={overlayOpen ? "Fechar menu" : "Abrir menu"}
        >
          {overlayOpen ? "✖️" : "☰"} <span className="fp-label">Menu</span>
        </button>
      </div>

      {NAV.map((sec) => (
        <section key={sec.title}>
          {sec.title ? <div className="fp-nav-section">{sec.title}</div> : null}

          {sec.groups.map((g, gi) => (
            <div key={gi}>
              {g.items.map((it) => {
                const active = pathname === it.href; // apenas o item exato fica ativo
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="fp-item"
                    data-active={active ? "true" : undefined}
                    title={collapsed ? it.label : undefined}
                    onClick={closeMobile}
                  >
                    <span aria-hidden className="fp-ico">{ICONS[it.icon]}</span>
                    <span className="fp-label">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </section>
      ))}
    </nav>
  );
}
