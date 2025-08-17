"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useSidebar } from "./SidebarWrapper";

type Item =
  | { type: "link"; href: string; icon: string; label: string }
  | { type: "group"; icon: string; label: string; children: { href: string; label: string; icon?: string }[] };

const MENU: Item[] = [
  { type: "link", href: "/dashboard", icon: "🏠", label: "Início" },
  { type: "link", href: "/dashboard/sessions", icon: "🗓️", label: "Sessões" },
  { type: "link", href: "/dashboard/messages", icon: "💬", label: "Mensagens" },
  { type: "link", href: "/dashboard/profile", icon: "👤", label: "Perfil" },
  { type: "link", href: "/dashboard/reports", icon: "📊", label: "Relatórios" },
  { type: "link", href: "/dashboard/settings", icon: "⚙️", label: "Definições" },

  {
    type: "group",
    icon: "🛡️",
    label: "Administração",
    children: [
      { href: "/dashboard/admin", label: "Administração" },
      { href: "/dashboard/admin/approvals", label: "Aprovações", icon: "✅" },
      { href: "/dashboard/admin/exercises", label: "Exercícios", icon: "🏋️" },
      { href: "/dashboard/admin/plans", label: "Planos (Admin)", icon: "🗂️" },
      { href: "/dashboard/admin/roster", label: "Escala/Equipa", icon: "🧩" },
      { href: "/dashboard/admin/users", label: "Utilizadores", icon: "👥" },
    ],
  },

  {
    type: "group",
    icon: "👥",
    label: "PT",
    children: [
      { href: "/dashboard/pt", label: "PT" },
      { href: "/dashboard/pt/clients", label: "Clientes", icon: "🧑‍🤝‍🧑" },
      { href: "/dashboard/pt/library", label: "Biblioteca", icon: "📚" },
      { href: "/dashboard/pt/plans", label: "Planos", icon: "📝" },
    ],
  },

  {
    type: "group",
    icon: "💻",
    label: "Sistema",
    children: [
      { href: "/dashboard/system", label: "Sistema" },
      { href: "/dashboard/system/health", label: "Health", icon: "🩺" },
      { href: "/dashboard/system/logs", label: "Logs", icon: "🧾" },
    ],
  },
];

function Row({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={"nav-item" + (active ? " active" : "")}
      title={label}
      aria-current={active ? "page" : undefined}
    >
      <span className="nav-ico" aria-hidden>{icon}</span>
      <span className="nav-txt">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { collapsed, setCollapsed, pinned, setPinned } = useSidebar();
  const pathname = usePathname();

  const isActive = (href: string) => {
    // ativo só quando a rota é exatamente a mesma ou prefixo completo (sem marcar o PAI como ativo)
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href;
  };

  return (
    <nav className="nav" aria-label="Menu lateral">
      {/* topo: ações */}
      <div className="nav-actions">
        <button
          className="btn ghost"
          onClick={() => setPinned(!pinned)}
          title={pinned ? "Soltar (overlay)" : "Afixar"}
          aria-pressed={pinned}
        >
          {pinned ? "📌 Solta" : "📍 Afixar"}
        </button>

        <button
          className="btn ghost"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir" : "Recolher"}
          aria-pressed={collapsed}
        >
          {collapsed ? "⟩ Expandir" : "⟨ Recolher"}
        </button>
      </div>

      {/* lista */}
      <div className="nav-scroll">
        {MENU.map((item, i) => {
          if (item.type === "link") {
            return (
              <Row
                key={i}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href)}
              />
            );
          }

          // group
          const anyChildActive = item.children.some((c) => isActive(c.href));
          return (
            <div key={i} className="nav-group">
              {/* trigger do grupo nunca leva .active; apenas marca expandido */}
              <div className={"nav-group-trigger" + (anyChildActive ? " open" : "")}>
                <span className="nav-ico" aria-hidden>
                  {item.icon}
                </span>
                <span className="nav-txt">{item.label}</span>
              </div>

              <div className={"nav-sub" + (anyChildActive ? " show" : "")}>
                {item.children.map((c) => (
                  <Row
                    key={c.href}
                    href={c.href}
                    icon={c.icon ?? "•"}
                    label={c.label}
                    active={isActive(c.href)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* bottom */}
      <div className="nav-bottom">
        <div className="muted">* Sessão iniciada</div>
        <button
          className="btn danger block"
          onClick={() => (window.location.href = "/api/auth/signout?callbackUrl=/login")}
        >
          Terminar sessão
        </button>
      </div>
    </nav>
  );
}
