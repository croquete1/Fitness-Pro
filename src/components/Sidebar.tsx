"use client";

import React, { useMemo } from "react";
import Menu from "./sidebar/Menu";
import { useSidebarState } from "./SidebarWrapper";

/* Tipagens mínimas para o Menu existente */
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

/* Ícones simples (mantém o teu estilo) */
const ICON = {
  dashboard: "📊",
  reports: "📈",
  settings: "⚙️",
  clients: "🧑‍🤝‍🧑",
  plans: "📘",
  library: "📚",
  approvals: "✅",
  users: "👥",
  system: "🖥️",
  health: "🛟",
};

/* Dados do menu (sem regras de role para simplificar aqui) */
function buildMenu(): Entry[] {
  return [
    {
      kind: "group",
      label: "Geral",
      items: [
        { kind: "item", href: "/dashboard", label: "Dashboard", icon: ICON.dashboard, activeExact: true },
        { kind: "item", href: "/dashboard/reports", label: "Relatórios", icon: ICON.reports },
        { kind: "item", href: "/dashboard/settings", label: "Definições", icon: ICON.settings },
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

/* Ajuda a gerar a coluna de ícones (rail) com espaçamento consistente */
function flattenIcons(entries: Entry[]): { href: string; icon: React.ReactNode; label: string }[] {
  const out: { href: string; icon: React.ReactNode; label: string }[] = [];
  for (const e of entries) {
    if ((e as Group).items) {
      for (const it of (e as Group).items) {
        out.push({ href: it.href, icon: it.icon, label: it.label });
      }
    } else {
      const it = e as Item;
      out.push({ href: it.href, icon: it.icon, label: it.label });
    }
  }
  return out;
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

  const data = useMemo(() => buildMenu(), []);
  const icons = useMemo(() => flattenIcons(data), [data]);

  const railW = 64;
  const fullW = 260;

  const showOverlay = !pinned && overlayOpen;

  return (
    <aside
      className="fp-sidebar"
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "100dvh",
        borderRight: "1px solid var(--border)",
        background: "var(--sidebar-bg)",
        width: pinned ? (collapsed ? railW : fullW) : railW,
        transition: "width 420ms cubic-bezier(.2,.8,.2,1)",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        zIndex: 50,
      }}
      aria-label="Sidebar de navegação"
      onMouseEnter={() => { if (!pinned) openOverlay(); }}
      onMouseLeave={() => { if (!pinned) closeOverlay(); }}
    >
      {/* Cabeçalho/brand da sidebar */}
      <div
        className="fp-sb-head"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          padding: "10px",
          gap: 8,
          borderBottom: "1px solid var(--border)",
          minHeight: 56,
          background: "var(--sidebar-bg)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="fp-sb-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="logo"
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
              border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
              fontSize: 16,
            }}
          >
            💪
          </span>
          {pinned && !collapsed && (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
            </div>
          )}
        </div>

        <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
          {/* botão expandir/encolher SEMPRE visível na sidebar */}
          <button
            className="btn icon"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir" : "Encolher"}
            title={collapsed ? "Expandir" : "Encolher"}
          >
            ☰
          </button>
          {/* botão fixar/desafixar */}
          <button
            className="btn icon"
            onClick={togglePinned}
            aria-label={pinned ? "Desafixar" : "Fixar"}
            title={pinned ? "Desafixar" : "Fixar"}
          >
            📌
          </button>
        </div>
      </div>

      {/* RAIL: lista vertical de ícones (alinhada e com tooltips nativos via title) */}
      <div
        aria-hidden="true"
        style={{
          padding: "6px 0",
          display: "grid",
          gap: 18,
          alignContent: "start",
          justifyItems: "center",
        }}
      >
        {icons.map((it) => (
          <a
            key={it.href}
            href={it.href}
            className="btn icon"
            title={it.label}
            style={{
              width: 40,
              height: 40,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: "transparent",
            }}
          >
            <span aria-hidden>{it.icon}</span>
          </a>
        ))}
      </div>

      {/* Painel completo: 
          - render estático quando afixada e expandida
          - overlay suave ao pairar quando NÃO afixada
      */}
      {(pinned && !collapsed) && (
        <div style={{ overflow: "auto", padding: 8 }}>
          <Menu data={data} />
        </div>
      )}

      {!pinned && (
        <div
          style={{
            position: "fixed",
            left: railW,
            top: 0,
            bottom: 0,
            width: fullW,
            background: "var(--sidebar-bg)",
            borderRight: "1px solid var(--border)",
            boxShadow: "var(--shadow-1)",
            transform: showOverlay ? "translateX(0)" : "translateX(-12px)",
            opacity: showOverlay ? 1 : 0,
            pointerEvents: showOverlay ? "auto" : "none",
            transition:
              "transform 420ms cubic-bezier(.2,.8,.2,1), opacity 420ms ease",
            zIndex: 60,
            display: "grid",
            gridTemplateRows: "56px 1fr",
          }}
          // clique fora fecha o overlay (fica a cargo do mouseleave também)
        >
          {/* cabeçalho espelhado para consistência visual */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="logo" aria-hidden
                style={{
                  width: 28, height: 28, borderRadius: 10,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background:
                    "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
                  border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
                  fontSize: 16,
                }}>
                💪
              </span>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
            </div>
            <div style={{ display: "inline-flex", gap: 6 }}>
              <button className="btn icon" onClick={toggleCollapsed} title={collapsed ? "Expandir" : "Encolher"} aria-label="Alternar largura">☰</button>
              <button className="btn icon" onClick={togglePinned} title={pinned ? "Desafixar" : "Fixar"} aria-label="Fixar">📌</button>
            </div>
          </div>

          <div style={{ overflow: "auto", padding: 8 }}>
            <Menu data={data} />
          </div>
        </div>
      )}
    </aside>
  );
}
