"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarState } from "./SidebarWrapper";

type Item = { href: string; label: string; icon: string };
type Group = { title: string; items: Item[] };

const NAV: Group[] = [
  {
    title: "GERAL",
    items: [
      { href: "/dashboard",        label: "Dashboard",    icon: "📊" },
      { href: "/dashboard/agenda", label: "Agenda",       icon: "📅" },
      { href: "/dashboard/notifications", label: "Notificações", icon: "🔔" },
    ],
  },
  {
    title: "PERSONAL TRAINER",
    items: [
      { href: "/dashboard/pt/clients",  label: "Clientes",       icon: "🧑‍🤝‍🧑" },
      { href: "/dashboard/pt/plans",    label: "Planos de treino",icon: "📘" },
      { href: "/dashboard/pt/library",  label: "Biblioteca",      icon: "📚" },
    ],
  },
  {
    title: "ADMINISTRAÇÃO",
    items: [
      { href: "/dashboard/admin/users",    label: "Utilizadores", icon: "👥" },
      { href: "/dashboard/admin/approvals",label: "Aprovações",   icon: "✅" },
      { href: "/dashboard/reports",        label: "Relatórios",   icon: "📈" },
      { href: "/dashboard/settings",       label: "Definições",   icon: "⚙️" },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { href: "/dashboard/system/health",  label: "Saúde do sistema", icon: "🩺" },
      { href: "/dashboard/system/logs",    label: "Logs de auditoria", icon: "🧾" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { pinned, collapsed, setPinned, setCollapsed } = useSidebarState();

  return (
    <aside
      className="fp-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      data-pinned={pinned ? "true" : "false"}
      aria-label="Navegação lateral"
    >
      <div className="sb-top">
        <button
          type="button"
          className="sb-btn"
          aria-pressed={pinned}
          title={pinned ? "Desafixar" : "Afixar"}
          onClick={() => setPinned(!pinned)}
        >
          📌
        </button>

        <button
          type="button"
          className="sb-btn"
          aria-pressed={collapsed}
          title={collapsed ? "Expandir" : "Encolher"}
          onClick={() => setCollapsed(!collapsed)}
        >
          ⇤
        </button>
      </div>

      <nav className="fp-nav">
        {NAV.map((g) => (
          <div key={g.title} className="sb-group">
            <div className="sb-title">{g.title}</div>
            <div className="sb-list">
              {g.items.map((i) => {
                const active = pathname === i.href || pathname.startsWith(i.href + "/");
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className="sb-item"
                    data-active={active ? "true" : "false"}
                    title={collapsed ? i.label : undefined}
                  >
                    <span className="sb-ico" aria-hidden>{i.icon}</span>
                    <span className="sb-label">{i.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
