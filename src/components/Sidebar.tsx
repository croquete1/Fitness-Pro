"use client";

import React, { useMemo, useRef } from "react";
import { useSidebarState } from "./SidebarWrapper";
import Link from "next/link";

/** Ícones simples (emoji) – mantém os que combinámos */
const ICON = {
  dashboard: "📊",
  clients: "🧑‍🤝‍🧑",
  reports: "📈",
  settings: "⚙️",
  plans: "📘",
  library: "📚",
  approvals: "✅",
  users: "👥",
  system: "🛟",
};

type NavItem = { href: string; label: string; icon: string; activeExact?: boolean };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "GERAL",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: ICON.dashboard, activeExact: true },
      { href: "/dashboard/reports", label: "Relatórios", icon: ICON.reports },
      { href: "/dashboard/settings", label: "Definições", icon: ICON.settings },
    ],
  },
  {
    title: "PT",
    items: [
      { href: "/dashboard/pt/clients", label: "Clientes", icon: ICON.clients },
      { href: "/dashboard/pt/plans", label: "Planos", icon: ICON.plans },
      { href: "/dashboard/pt/library", label: "Biblioteca", icon: ICON.library },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { href: "/dashboard/admin/approvals", label: "Aprovações", icon: ICON.approvals },
      { href: "/dashboard/admin/users", label: "Utilizadores", icon: ICON.users },
    ],
  },
  {
    title: "SISTEMA",
    items: [{ href: "/dashboard/system/health", label: "Saúde do sistema", icon: ICON.system }],
  },
];

const RAIL_W = 64;      // rail compacto
const FULL_W = 264;     // sidebar expandida
const SPEED = 420;      // ms – mais suave

export default function Sidebar() {
  const {
    pinned,
    collapsed,
    overlayOpen,
    openOverlay,
    closeOverlay,
    toggleCollapsed,
    togglePinned,
  } = useSidebarState();

  /** aberta de facto (largura grande) – quando está afixada e não recolhida
   *  ou quando está a mostrar overlay (não afixada)
   */
  const expanded =
    (pinned && !collapsed) || (!pinned && overlayOpen);

  /** mouse leave com pequeno atraso para não "cortar" a animação */
  const leaveTimer = useRef<number | null>(null);
  const onEnter = () => {
    if (!pinned && collapsed) openOverlay();
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };
  const onLeave = () => {
    if (!pinned && collapsed) {
      leaveTimer.current = window.setTimeout(() => {
        closeOverlay();
      }, 120);
    }
  };

  const sections = useMemo(() => SECTIONS, []);

  return (
    <>
      {/* Scrim do overlay em ecrãs grandes quando não está afixada e abriu */}
      {!pinned && overlayOpen && (
        <button
          aria-label="Fechar menu"
          onClick={closeOverlay}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,.28)",
            backdropFilter: "blur(1px)",
            zIndex: 39,
          }}
        />
      )}

      <aside
        className="fp-sidebar"
        data-pinned={pinned}
        data-collapsed={collapsed}
        data-expanded={expanded}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          position: pinned ? "sticky" as const : ("fixed" as const),
          inset: pinned ? undefined : "0 auto 0 0",
          top: 0,
          alignSelf: "start",
          height: "100dvh",
          background: "var(--sidebar-bg)",
          color: "var(--sidebar-fg)",
          borderRight: "1px solid var(--border)",
          width: expanded ? FULL_W : RAIL_W,
          transition: `width ${SPEED}ms cubic-bezier(.22,1,.36,1), transform ${SPEED}ms cubic-bezier(.22,1,.36,1)`,
          transform: !pinned && !overlayOpen ? `translateX(-${FULL_W - RAIL_W}px)` : "translateX(0)",
          boxShadow: "var(--shadow-1)",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          zIndex: 40,
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: expanded ? "1fr auto auto" : "1fr",
            alignItems: "center",
            gap: 8,
            padding: 12,
            borderBottom: "1px solid var(--border)",
            minHeight: 56,
          }}
        >
          {/* Brand + hambúrguer ficam sempre dentro da sidebar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: 10,
                background:
                  "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
                border:
                  "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              💪
            </span>

            {expanded && (
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {/* retirado “Navegação” como pediste */}
                </div>
              </div>
            )}
          </div>

          {/* Botão hambúrguer – visível sempre, dentro do rail */}
          <button
            aria-label="Expandir/recolher"
            title="Expandir/recolher"
            onClick={toggleCollapsed}
            className="btn icon"
            style={{
              justifySelf: "end",
            }}
          >
            <span style={{ fontSize: 18 }}>≡</span>
          </button>

          {/* Botão pin – fica sempre visível (mesmo no rail) */}
          <button
            aria-label={pinned ? "Desafixar" : "Afixar"}
            title={pinned ? "Desafixar" : "Afixar"}
            onClick={togglePinned}
            className="btn icon"
          >
            {pinned ? "📌" : "📍"}
          </button>
        </div>

        {/* Navegação */}
        <nav
          aria-label="Navegação principal"
          style={{
            overflow: "auto",
            padding: expanded ? 10 : 6,
            display: "grid",
            gap: 10,
          }}
        >
          {sections.map((sec) => (
            <div key={sec.title} style={{ display: "grid", gap: 8 }}>
              {/* título da secção só visível expandida */}
              {expanded && (
                <div
                  className="text-muted"
                  style={{
                    fontSize: 12,
                    padding: "2px 10px",
                    letterSpacing: ".04em",
                  }}
                >
                  {sec.title}
                </div>
              )}

              <div style={{ display: "grid", gap: 6 }}>
                {sec.items.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="nav-item"
                    title={!expanded ? it.label : undefined}
                    style={{
                      display: "grid",
                      gridTemplateColumns: expanded ? "24px 1fr" : "1fr",
                      alignItems: "center",
                      gap: 10,
                      padding: expanded ? "10px 12px" : 10,
                      borderRadius: 12,
                      color: "var(--sidebar-fg)",
                      background: "transparent",
                    }}
                  >
                    <span
                      aria-hidden
                      className="nav-icon"
                      style={{
                        display: "inline-flex",
                        width: 24,
                        justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                      {it.icon}
                    </span>
                    {expanded && <span>{it.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
