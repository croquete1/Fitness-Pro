"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import Menu from "./sidebar/Menu";
import useSidebarState from "./SidebarWrapper";

/** Larguras consistentes com o layout */
const RAIL_W = 64;   // largura do "rail" (ícones) — quando recolhida ou desafixada
const PANEL_W = 260; // largura total — quando afixada e expandida

// Ícones de navegação (mantidos)
const ICON = {
  dashboard: "📊",
  clients: "🧑‍🤝‍🧑",
  plans: "📘",
  library: "📚",
  approvals: "✅",
  users: "👥",
  reports: "📈",
  settings: "⚙️",
  health: "🛟",
};

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

export default function Sidebar() {
  const {
    pinned,
    collapsed,
    overlayOpen,
    setOverlayOpen,
    togglePinned,
    toggleCollapsed,
    closeOverlay,
  } = useSidebarState();

  const data = useMemo(() => buildMenu(), []);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Se a sidebar for desafixada, o rail fica SEMPRE a RAIL_W.
  const railWidth = pinned ? (collapsed ? RAIL_W : PANEL_W) : RAIL_W;

  // Abrir ao aproximar/entrar no rail quando desafixada
  const onMouseEnterRail = () => {
    if (!pinned) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setOverlayOpen(true);
    }
  };
  // Dar um pequeno delay ao sair para evitar flicker ao mover para o flyout
  const onMouseLeaveRail = () => {
    if (!pinned) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => setOverlayOpen(false), 120);
    }
  };

  // Limpeza do timer
  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  // CSS global para “esconder labels” quando recolhida (sem tocar no teu Menu.tsx)
  const [injectCss, setInjectCss] = useState(false);
  useEffect(() => setInjectCss(true), []);
  const hideLabels = pinned && collapsed;

  return (
    <>
      {/* RAIL/placeholder que ocupa a coluna do grid */}
      <aside
        className="fp-sidebar"
        data-pinned={pinned ? "true" : "false"}
        data-collapsed={pinned && collapsed ? "true" : "false"}
        style={{
          position: "sticky",
          top: 0,
          alignSelf: "start",
          height: "100dvh",
          borderRight: "1px solid var(--border)",
          background: "var(--sidebar-bg)",
          width: railWidth,
          transition: "width 220ms ease",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          zIndex: 30,
        }}
        aria-label="Sidebar de navegação"
        onMouseEnter={onMouseEnterRail}
        onMouseLeave={onMouseLeaveRail}
      >
        {/* Cabeçalho da sidebar — com botões de Menu (recolher/expandir) e Afixar */}
        <div
          className="fp-sb-head"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            padding: 10,
            gap: 8,
            borderBottom: "1px solid var(--border)",
            minHeight: 56,
          }}
        >
          <div className="fp-sb-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden
              className="logo"
              style={{
                width: 28,
                height: 28,
                borderRadius: 10,
                background:
                  "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
                border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              💪
            </span>
            {railWidth > RAIL_W && (
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Navegação
                </div>
              </div>
            )}
          </div>

          <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
            {/* Botão de Menu (recolher/expandir) — dentro da sidebar */}
            <button
              className="btn icon"
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
              title={collapsed ? "Expandir" : "Recolher"}
              onClick={() => {
                if (!pinned) {
                  // Se estiver desafixada, clicar no menu abre o flyout
                  setOverlayOpen(true);
                  return;
                }
                toggleCollapsed();
              }}
            >
              {/* ícone hamburger simples */}
              <span aria-hidden>≡</span>
            </button>

            {/* Botão afixar/desafixar */}
            <button
              className="btn icon"
              aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
              title={pinned ? "Desafixar" : "Afixar"}
              onClick={togglePinned}
            >
              <span aria-hidden>{pinned ? "📌" : "📍"}</span>
            </button>
          </div>
        </div>

        {/* Lista de navegação (no rail mostra labels apenas quando expandida e afixada) */}
        <div style={{ overflow: "auto", padding: 8 }}>
          {/* injeta CSS global só depois do mount para evitar problemas em SSR */}
          {injectCss && hideLabels && (
            <style jsx global>{`
              .fp-sidebar[data-collapsed="true"] .nav-label { display: none !important; }
              .fp-sidebar[data-collapsed="true"] .nav-item { grid-template-columns: 24px !important; }
            `}</style>
          )}
          <Menu data={data as any} />
        </div>
      </aside>

      {/* SCRIM + FLYOUT quando DESAFIXADA e aberta */}
      {!pinned && overlayOpen && (
        <>
          {/* Scrim para clicar fora fechar */}
          <div
            onClick={closeOverlay}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2,6,23,.35)",
              backdropFilter: "blur(1px)",
              zIndex: 59,
            }}
          />
          {/* Flyout sobre o rail */}
          <div
            onMouseEnter={() => {
              if (hoverTimer.current) clearTimeout(hoverTimer.current);
            }}
            onMouseLeave={() => {
              if (hoverTimer.current) clearTimeout(hoverTimer.current);
              hoverTimer.current = setTimeout(() => setOverlayOpen(false), 120);
            }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              height: "100dvh",
              width: PANEL_W,
              background: "var(--sidebar-bg)",
              color: "var(--sidebar-fg)",
              borderRight: "1px solid var(--border)",
              boxShadow: "0 10px 30px rgba(15,23,42,.15)",
              display: "grid",
              gridTemplateRows: "auto 1fr",
              zIndex: 60,
              animation: "fp-slide-in 180ms ease",
            }}
          >
            {/* Cabeçalho do flyout — igual ao da sidebar */}
            <div
              className="fp-sb-head"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                padding: 10,
                gap: 8,
                borderBottom: "1px solid var(--border)",
                minHeight: 56,
              }}
            >
              <div className="fp-sb-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  aria-hidden
                  className="logo"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    background:
                      "linear-gradient(180deg, rgba(79,70,229,.25), rgba(79,70,229,.06))",
                    border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  💪
                </span>
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Fitness Pro</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Navegação
                  </div>
                </div>
              </div>

              <div className="fp-sb-actions" style={{ display: "inline-flex", gap: 6 }}>
                {/* Ao clicar no menu no flyout, apenas fecha */}
                <button
                  className="btn icon"
                  aria-label="Fechar menu"
                  title="Fechar"
                  onClick={closeOverlay}
                >
                  ✕
                </button>

                {/* Afixar diretamente a partir do flyout */}
                <button
                  className="btn icon"
                  aria-label="Afixar sidebar"
                  title="Afixar"
                  onClick={togglePinned}
                >
                  📌
                </button>
              </div>
            </div>

            <div style={{ overflow: "auto", padding: 8 }}>
              <Menu data={data as any} />
            </div>
          </div>

          {/* Animação discreta */}
          <style jsx global>{`
            @keyframes fp-slide-in {
              from { transform: translateX(-8px); opacity: .0; }
              to   { transform: translateX(0);     opacity: 1;  }
            }
          `}</style>
        </>
      )}
    </>
  );
}
