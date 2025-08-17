"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * ====== CONFIG ======
 * - Larguras e timings devem combinar com o teu global.css
 * - Mantive ícones “leves” (emoji/SVG inline) para não depender de libs.
 *   Se quiseres os teus ícones anteriores, substitui os fields `icon`.
 */
const SIDEBAR_WIDTH = 260;   // expandidA
const SIDEBAR_WIDTH_SM = 64; // encolhida
const TRANSITION_MS = 200;

type Role = "ADMIN" | "PT" | "CLIENT" | "ANY";

type Item = {
  kind: "item";
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
  activeExact?: boolean;
};

type Group = {
  kind: "group";
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
  items: Item[];
};

type Entry = Item | Group;

/** 
 * ====== MENU ======
 * Mantém as rotas que já tens no projeto para não quebrar nada.
 * Se tinhas ícones personalizados, substitui o `icon`.
 */
const menuData: Entry[] = [
  {
    kind: "item",
    href: "/dashboard",
    label: "Dashboard",
    icon: <span aria-hidden>📊</span>,
  },
  {
    kind: "group",
    label: "Personal Trainer",
    icon: <span aria-hidden>🏋️</span>,
    items: [
      { kind: "item", href: "/dashboard/pt/clients", label: "Clientes", icon: <span>🧑‍🤝‍🧑</span> },
      { kind: "item", href: "/dashboard/pt/plans", label: "Planos", icon: <span>📘</span> },
      { kind: "item", href: "/dashboard/pt/library", label: "Biblioteca", icon: <span>📚</span> },
    ],
  },
  {
    kind: "group",
    label: "Administração",
    icon: <span aria-hidden>🛠️</span>,
    items: [
      { kind: "item", href: "/dashboard/admin/users", label: "Utilizadores", icon: <span>👥</span> },
      { kind: "item", href: "/dashboard/approvals", label: "Aprovações", icon: <span>✅</span> },
      { kind: "item", href: "/dashboard/reports", label: "Relatórios", icon: <span>📈</span> },
      { kind: "item", href: "/dashboard/settings", label: "Definições", icon: <span>⚙️</span> },
      { kind: "item", href: "/dashboard/system/health", label: "Saúde do sistema", icon: <span>🖥️</span> },
      { kind: "item", href: "/dashboard/system/logs", label: "Logs de auditoria", icon: <span>🧾</span> },
    ],
  },
];

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023.98px)").matches;
}

/**
 * Persiste flags simples em localStorage sem barulho SSR.
 */
function readLS(key: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "1";
  } catch {
    return fallback;
  }
}
function writeLS(key: string, v: boolean) {
  try {
    localStorage.setItem(key, v ? "1" : "0");
  } catch {}
}

export default function Sidebar() {
  const pathname = usePathname();
  const [pinned, setPinned] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [overlayOpen, setOverlayOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const hoverTimer = useRef<number | null>(null);
  const asideRef = useRef<HTMLDivElement>(null);

  // Boot flags (apenas no client)
  useEffect(() => {
    setIsMobile(isMobileViewport());
    const onResize = () => setIsMobile(isMobileViewport());
    window.addEventListener("resize", onResize);

    // Recuperar preferências do utilizador
    setPinned(readLS("fp:sidebar:pinned", true));
    setCollapsed(readLS("fp:sidebar:collapsed", false));

    // Fechar overlay com ESC
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlayOpen(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Guardar preferências
  useEffect(() => writeLS("fp:sidebar:pinned", pinned), [pinned]);
  useEffect(() => writeLS("fp:sidebar:collapsed", collapsed), [collapsed]);

  // Fechar overlay se navega
  useEffect(() => {
    setOverlayOpen(false);
  }, [pathname]);

  // Quando está encolhida e fixada, abrir ao passar o rato (hover-reveal)
  const onMouseEnter = () => {
    if (!pinned || !collapsed || isMobile) return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      asideRef.current?.setAttribute("data-hovering", "true");
    }, 60);
  };
  const onMouseLeave = () => {
    if (!pinned || !collapsed || isMobile) return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    asideRef.current?.removeAttribute("data-hovering");
  };

  // Handlers
  const toggleCollapsed = () => {
    if (isMobile) {
      setOverlayOpen((v) => !v);
      return;
    }
    setCollapsed((v) => !v);
  };
  const togglePinned = () => setPinned((v) => !v);

  // Estilos calculados (evita depender de wrapper/context)
  const sidebarStyle: React.CSSProperties = useMemo(() => {
    const hovering = asideRef.current?.getAttribute("data-hovering") === "true";
    const isCollapsed = pinned ? collapsed : false;
    const width =
      isCollapsed && !hovering ? SIDEBAR_WIDTH_SM : SIDEBAR_WIDTH;
    return {
      width,
      minWidth: width,
      maxWidth: width,
      transition: `width ${TRANSITION_MS}ms ease`,
      borderRight: "1px solid var(--border)",
      background: "var(--bg)",
      height: "100dvh",
      position: isMobile ? "fixed" : "sticky",
      top: isMobile ? 0 : "var(--header-h, 0px)",
      left: 0,
      zIndex: isMobile ? 60 : "auto",
      transform:
        isMobile && !overlayOpen ? "translateX(-100%)" : "translateX(0)",
      boxShadow: isMobile
        ? overlayOpen
          ? "0 10px 30px rgba(0,0,0,.18)"
          : "none"
        : "none",
      transitionProperty: isMobile
        ? "transform, box-shadow, width"
        : "width",
    };
  }, [pinned, collapsed, overlayOpen, isMobile]);

  const showLabels = useMemo(() => {
    const hovering = asideRef.current?.getAttribute("data-hovering") === "true";
    const isCollapsed = pinned ? collapsed : false;
    return !(isCollapsed && !hovering);
  }, [pinned, collapsed, overlayOpen]);

  // Overlay (mobile)
  const overlay = isMobile ? (
    <div
      onClick={() => setOverlayOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.42)",
        backdropFilter: "blur(1px)",
        opacity: overlayOpen ? 1 : 0,
        pointerEvents: overlayOpen ? "auto" : "none",
        transition: "opacity .2s ease",
        zIndex: 50,
      }}
    />
  ) : null;

  // Utilitário para saber se um item está ativo (só o próprio, não o pai)
  const isActive = (it: Item) => {
    if (it.activeExact) return pathname === it.href;
    return pathname === it.href || pathname.startsWith(it.href + "/");
  };

  return (
    <>
      {overlay}
      <aside
        ref={asideRef}
        className="fp-sidebar"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label="Navegação principal"
        data-pinned={pinned ? "true" : "false"}
        data-collapsed={pinned && collapsed ? "true" : "false"}
        style={sidebarStyle}
      >
        {/* Header da sidebar (logo + ações) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 8,
            padding: 12,
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            background: "var(--bg)",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 20 }}>💪</span>
            <span
              style={{
                fontWeight: 700,
                whiteSpace: "nowrap",
                opacity: showLabels ? 1 : 0,
                transform: showLabels ? "translateX(0)" : "translateX(-8px)",
                transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
              }}
            >
              Fitness&nbsp;Pro
            </span>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* Botão colapsar/expandir */}
            <button
              type="button"
              onClick={toggleCollapsed}
              title={isMobile ? (overlayOpen ? "Fechar" : "Abrir") : collapsed ? "Expandir" : "Encolher"}
              aria-label="Alternar largura da sidebar"
              className="btn ghost"
              style={{ width: 36, height: 36, borderRadius: 10 }}
            >
              {/* Ícone “seta dupla” */}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d={pinned && collapsed && !overlayOpen ? 
                    "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" : // chevron-left
                    "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"     // chevron-right
                  }
                />
              </svg>
            </button>

            {/* Botão fixar/desafixar (não mostrar em mobile) */}
            {!isMobile && (
              <button
                type="button"
                onClick={togglePinned}
                title={pinned ? "Desafixar" : "Afixar"}
                aria-pressed={pinned}
                aria-label="Fixar ou desafixar sidebar"
                className="btn ghost"
                style={{ width: 36, height: 36, borderRadius: 10 }}
              >
                {/* Pin simples */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d={
                      pinned
                        ? "M14 4l-2 2-5 5 6 6 5-5 2-2-6-6zM4 20l6-2-4-4-2 6z" // pin “cheio”
                        : "M16 9l-6 6-2-2 6-6 2 2zm-1-5l-2 2 6 6 2-2-6-6zM4 20l6-2-4-4-2 6z"
                    }
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* NAV — só a sidebar faz scroll */}
        <nav
          style={{
            padding: 8,
            overflow: "auto",
            height: `calc(100% - 60px)`,
            alignContent: "start",
          }}
        >
          {menuData.map((entry, idx) =>
            entry.kind === "item" ? (
              <a
                key={(entry as Item).href + idx}
                href={(entry as Item).href}
                className="nav-item"
                data-active={isActive(entry as Item) ? "true" : "false"}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span aria-hidden className="nav-icon" style={{ display: "grid", placeItems: "center" }}>
                  {(entry as Item).icon}
                </span>
                <span
                  className="nav-label"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    opacity: showLabels ? 1 : 0,
                    transform: showLabels ? "translateX(0)" : "translateX(-8px)",
                    transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
                  }}
                >
                  {(entry as Item).label}
                </span>
              </a>
            ) : (
              <div key={`grp-${idx}`} style={{ marginTop: 8 }}>
                <div
                  className="nav-group-heading"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr",
                    gap: 10,
                    alignItems: "center",
                    padding: "8px 12px",
                    color: "var(--muted)",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  <span aria-hidden style={{ opacity: showLabels ? 1 : 0 }}>
                    {(entry as Group).icon}
                  </span>
                  <span
                    style={{
                      opacity: showLabels ? 1 : 0,
                      transform: showLabels ? "translateX(0)" : "translateX(-8px)",
                      transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
                    }}
                  >
                    {(entry as Group).label}
                  </span>
                </div>

                <div style={{ display: "grid", gap: 4, marginTop: 4 }}>
                  {(entry as Group).items.map((it) => (
                    <a
                      key={it.href}
                      href={it.href}
                      className="nav-subitem"
                      data-active={isActive(it) ? "true" : "false"}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "24px 1fr",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 10,
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <span aria-hidden className="nav-icon" style={{ display: "grid", placeItems: "center" }}>
                        {it.icon}
                      </span>
                      <span
                        className="nav-label"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          opacity: showLabels ? 1 : 0,
                          transform: showLabels ? "translateX(0)" : "translateX(-8px)",
                          transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
                        }}
                      >
                        {it.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )
          )}
        </nav>
      </aside>
    </>
  );
}
