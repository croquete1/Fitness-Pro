"use client";

import Link from "next/link";
import { useSidebarState } from "@/components/SidebarWrapper";

export default function Sidebar() {
  const { collapsed, overlay, toggleCollapsed, togglePinned } =
    useSidebarState();

  return (
    <aside
      className="fp-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      data-overlay={overlay ? "true" : "false"}
      suppressHydrationWarning
    >
      {/* Cabeçalho da sidebar */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <span className="logo" aria-hidden>💪</span>
          {!collapsed && <strong>Fitness Pro</strong>}
        </div>

        {/* Botões próprios da sidebar */}
        <div className="fp-sb-actions">
          <button
            className="btn icon btn-toggle--sidebar"
            aria-label="Alternar sidebar"
            onClick={toggleCollapsed}
            title="Expandir/compactar"
          >
            ☰
          </button>

          {!collapsed && (
            <button
              className="btn icon"
              aria-label="Afixar/Desafixar"
              onClick={togglePinned}
              title="Afixar/Desafixar"
            >
              📌
            </button>
          )}
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        <div className="nav-section">Geral</div>
        <div className="nav-group">
          <NavItem href="/dashboard" icon="📊" label="Dashboard" />
          <NavItem href="/dashboard/reports" icon="📈" label="Relatórios" />
          <NavItem href="/dashboard/settings" icon="⚙️" label="Definições" />
        </div>

        <div className="nav-section">PT</div>
        <div className="nav-group">
          <NavItem href="/dashboard/pt/clients" icon="👥" label="Clientes" />
          <NavItem href="/dashboard/pt/plans" icon="📦" label="Planos" />
          <NavItem href="/dashboard/pt/library" icon="📚" label="Biblioteca" />
        </div>

        <div className="nav-section">Admin</div>
        <div className="nav-group">
          <NavItem href="/dashboard/admin/approvals" icon="✅" label="Aprovações" />
          <NavItem href="/dashboard/admin/users" icon="👤" label="Utilizadores" />
        </div>

        <div className="nav-section">Sistema</div>
        <div className="nav-group">
          <NavItem href="/dashboard/system/health" icon="🩺" label="Saúde do sistema" />
        </div>
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link className="nav-item" href={href} data-active={active ? "true" : "false"}>
      <span className="nav-icon" aria-hidden>
        {icon}
      </span>
      <span className="nav-label">{label}</span>
    </Link>
  );
}
