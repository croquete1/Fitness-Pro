"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSidebarState } from "./SidebarWrapper";

/** Ícones simples (mantém os teus) */
const ICON = {
  dashboard: "📊",
  reports: "📑",
  settings: "⚙️",
  clients: "🧑‍🤝‍🧑",
  plans: "📘",
  library: "📚",
  approvals: "✅",
  users: "👥",
  health: "🛟",
};

type LinkItem = { href: string; label: string; icon?: React.ReactNode; exact?: boolean };

function NavItem({ href, label, icon, exact }: LinkItem) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <a
      href={href}
      className="nav-item"
      data-active={active ? "true" : "false"}
      title={label}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </a>
  );
}

export default function Sidebar() {
  const {
    pinned,
    collapsed,
    overlayOpen,
    togglePinned,
    toggleCollapsed,
    openOverlay,
    closeOverlay,
  } = useSidebarState();

  /** largura calculada (suave e previsível) */
  const widthPx = useMemo(() => {
    const W_COLLAPSED = 64; // coluna de ícones
    const W_EXPANDED = 260; // sidebar aberta
    if (pinned) return collapsed ? W_COLLAPSED : W_EXPANDED;
    return overlayOpen ? W_EXPANDED : W_COLLAPSED; // desafixada = sobreposta
  }, [pinned, collapsed, overlayOpen]);

  /** dados do menu */
  const sections = useMemo(
    () => [
      {
        name: "GERAL",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: ICON.dashboard, exact: true },
          { href: "/dashboard/reports", label: "Relatórios", icon: ICON.reports },
          { href: "/dashboard/settings", label: "Definições", icon: ICON.settings },
        ],
      },
      {
        name: "PT",
        items: [
          { href: "/dashboard/pt/clients", label: "Clientes", icon: ICON.clients },
          { href: "/dashboard/pt/plans", label: "Planos", icon: ICON.plans },
          { href: "/dashboard/pt/library", label: "Biblioteca", icon: ICON.library },
        ],
      },
      {
        name: "ADMIN",
        items: [
          { href: "/dashboard/admin/approvals", label: "Aprovações", icon: ICON.approvals },
          { href: "/dashboard/admin/users", label: "Utilizadores", icon: ICON.users },
        ],
      },
      {
        name: "SISTEMA",
        items: [{ href: "/dashboard/system/health", label: "Saúde do sistema", icon: ICON.health }],
      },
    ],
    []
  );

  return (
    <aside
      className="fp-sidebar"
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      data-overlay={overlayOpen ? "true" : "false"}
      style={{
        width: widthPx,
        position: pinned ? "sticky" : "fixed",
        top: 0,
        left: 0,
        height: "100dvh",
        zIndex: 50,
        transition: "width 420ms cubic-bezier(0.22,1,0.36,1)",
        borderRight: "1px solid var(--border)",
        background: "var(--sidebar-bg)",
        display: "grid",
        gridTemplateRows: "auto 1fr",
      }}
      onMouseEnter={() => {
        // abre ao aproximar quando NÃO está fixa
        if (!pinned) openOverlay();
      }}
      onMouseLeave={() => {
        if (!pinned) closeOverlay();
      }}
      aria-label="Sidebar"
    >
      {/* Cabeçalho (logo + hamburger + pin) */}
      <div className="fp-sb-head" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="fp-sb-brand">
          <span className="logo" aria-hidden>
            💪
          </span>
          {/* sem “Navegação” como pediste */}
        </div>

        {/* ações sempre visíveis, dentro da sidebar */}
        <div className="fp-sb-actions">
          {/* Hamburger: se estiver fixa, alterna recolhido; se não estiver, fixa */}
          <button
            className="btn icon"
            aria-label="Menu"
            title={pinned ? (collapsed ? "Expandir" : "Recolher") : "Fixar sidebar"}
            onClick={() => (pinned ? toggleCollapsed() : togglePinned())}
          >
            <span aria-hidden>☰</span>
          </button>

          {/* Pin / Unpin explícito */}
          <button
            className="btn icon"
            aria-label={pinned ? "Desafixar" : "Fixar"}
            title={pinned ? "Desafixar" : "Fixar"}
            onClick={() => togglePinned()}
          >
            {pinned ? "📌" : "📍"}
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav" aria-label="Principal" style={{ overflow: "auto", padding: 8 }}>
        {sections.map((sec) => (
          <div key={sec.name}>
            {/* Esconde títulos quando recolhida para evitar “buracos” verticais */}
            {!collapsed && pinned && (
              <div className="nav-section" aria-hidden>
                {sec.name}
              </div>
            )}
            <div className="nav-group">
              {sec.items.map((it) => (
                <NavItem
                  key={it.href}
                  href={it.href}
                  label={it.label}
                  icon={it.icon}
                  exact={it.exact}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
