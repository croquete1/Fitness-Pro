"use client";

import Link from "next/link";
import { useSidebarState } from "./SidebarWrapper";

export default function Sidebar() {
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebarState();

  return (
    <aside
      className="fp-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      data-overlay={!pinned && collapsed ? "true" : "false"}
    >
      {/* Cabeçalho */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <span className="logo">💪</span>
          {!collapsed && <strong>Fitness Pro</strong>}
        </div>

        <div className="fp-sb-actions">
          {/* ☰ -> ENCOLHER/EXPANDIR (corrigido) */}
          <button
            className="btn icon"
            aria-label="Alternar sidebar"
            title={collapsed ? "Expandir" : "Encolher"}
            onClick={toggleCollapsed}
          >
            ☰
          </button>

          {/* 📌 -> Afixar/Desafixar (corrigido) */}
          <button
            className={`btn icon ${pinned ? "is-active" : ""}`}
            aria-label={pinned ? "Desafixar" : "Afixar"}
            aria-pressed={pinned}
            title={pinned ? "Desafixar" : "Afixar"}
            onClick={togglePinned}
          >
            📌
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        <div className="nav-section">GERAL</div>
        <div className="nav-group">
          <Link href="/dashboard" className="nav-item" data-active="true">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </Link>
          <Link href="/dashboard/reports" className="nav-item">
            <span className="nav-icon">🧾</span>
            <span className="nav-label">Relatórios</span>
          </Link>
          <Link href="/dashboard/settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Definições</span>
          </Link>
        </div>

        <div className="nav-section">PT</div>
        <div className="nav-group">
          <Link href="/dashboard/pt/clients" className="nav-item">
            <span className="nav-icon">🧑‍🤝‍🧑</span>
            <span className="nav-label">Clientes</span>
          </Link>
          <Link href="/dashboard/pt/plans" className="nav-item">
            <span className="nav-icon">📦</span>
            <span className="nav-label">Planos</span>
          </Link>
          <Link href="/dashboard/pt/library" className="nav-item">
            <span className="nav-icon">📚</span>
            <span className="nav-label">Biblioteca</span>
          </Link>
        </div>

        <div className="nav-section">ADMIN</div>
        <div className="nav-group">
          <Link href="/dashboard/admin/approvals" className="nav-item">
            <span className="nav-icon">✅</span>
            <span className="nav-label">Aprovações</span>
          </Link>
          <Link href="/dashboard/admin/users" className="nav-item">
            <span className="nav-icon">👥</span>
            <span className="nav-label">Utilizadores</span>
          </Link>
        </div>

        <div className="nav-section">SISTEMA</div>
        <div className="nav-group">
          <Link href="/dashboard/system/health" className="nav-item">
            <span className="nav-icon">🧩</span>
            <span className="nav-label">Saúde do sistema</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
