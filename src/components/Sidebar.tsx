"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";

// simples ícones baseados em emoji (os mesmos que já usa)
const Icon = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[18px] leading-none">{children}</span>
);

// menu (mantém estrutura e ordem atual)
const MENU = [
  {
    label: "GERAL",
    items: [
      { href: "/dashboard", title: "Dashboard", icon: "📊" },
      { href: "/dashboard/reports", title: "Relatórios", icon: "🧾" },
      { href: "/dashboard/settings", title: "Definições", icon: "⚙️" },
    ],
  },
  {
    label: "PT",
    items: [
      { href: "/dashboard/pt/clients", title: "Clientes", icon: "👫" },
      { href: "/dashboard/pt/plans", title: "Planos", icon: "📘" },
      { href: "/dashboard/pt/library", title: "Biblioteca", icon: "📚" },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { href: "/dashboard/admin/approvals", title: "Aprovações", icon: "✅" },
      { href: "/dashboard/admin/users", title: "Utilizadores", icon: "👥" },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { href: "/dashboard/system/health", title: "Saúde do sistema", icon: "🩺" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    pinned, collapsed, isExpanded,
    isMobile, overlayOpen,
    railWidth, panelWidth,
    togglePinned, toggleCollapsed,
    openOverlay, closeOverlay, setOverlayOpen,
  } = useSidebar();

  // hover em rail compacto (desktop) para expandir sem “afixar”
  const [hoveringRail, setHoveringRail] = useState(false);
  const panelVisible =
    (!pinned && overlayOpen) || (pinned && (!collapsed || hoveringRail));

  // ESC para fechar overlay
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlayOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, setOverlayOpen]);

  // bloquear scroll quando overlay aberto (mobile/desktop desafixado)
  useEffect(() => {
    if (!overlayOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [overlayOpen]);

  // botão hamburguer: no modo afixado alterna compactar/expandir; no desafixado abre/fecha gaveta
  const onHamburger = () => {
    if (pinned) {
      toggleCollapsed();
    } else {
      setOverlayOpen(!overlayOpen);
    }
  };

  // rail – sempre presente
  return (
    <>
      {/* Espaçador do rail dentro do fluxo para empurrar o conteúdo */}
      <div style={{ width: railWidth }} className="shrink-0" />

      {/* Rail fixo na esquerda */}
      <aside
        className="fixed inset-y-0 left-0 z-40 border-r border-black/5 bg-white/80 backdrop-blur-md dark:bg-zinc-900/70"
        style={{ width: railWidth }}
        onMouseEnter={() => { if (pinned && collapsed && !isMobile) setHoveringRail(true); }}
        onMouseLeave={() => { if (pinned && collapsed && !isMobile) setHoveringRail(false); }}
      >
        {/* Topo do rail: logo + (hamburger) + pin */}
        <div className="flex items-center justify-between px-2 pt-3 pb-2">
          <button
            aria-label="Ir para dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/5 bg-white/70 shadow-sm hover:bg-white transition"
            onClick={() => (window.location.href = "/dashboard")}
            title="Fitness Pro"
          >
            <span className="text-[18px]">💪</span>
          </button>

          <div className="flex gap-1">
            <button
              aria-label="Menu"
              title="Menu"
              onClick={onHamburger}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/5 bg-white/70 shadow-sm hover:bg-white transition"
            >
              <span className="text-[18px]">≡</span>
            </button>
            <button
              aria-label={pinned ? "Desafixar" : "Afixar"}
              title={pinned ? "Desafixar" : "Afixar"}
              onClick={togglePinned}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/5 bg-white/70 shadow-sm hover:bg-white transition"
            >
              <span className="text-[18px]">{pinned ? "📌" : "📍"}</span>
            </button>
          </div>
        </div>

        {/* Coluna de ícones (rail) – o espaçamento é igual ao do painel, para “bater” visualmente */}
        <nav className="mt-1 flex h-[calc(100vh-56px)] flex-col overflow-y-auto pb-4">
          {MENU.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-3 text-[10px] uppercase tracking-wide text-zinc-400">{group.label}</div>
              <ul className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={[
                          "mx-2 flex h-10 items-center justify-center rounded-xl border transition",
                          active
                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30"
                            : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        ].join(" ")}
                        title={item.title}
                        aria-label={item.title}
                      >
                        <Icon>{item.icon}</Icon>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Painel expansível (gaveta) */}
      <div
        className="pointer-events-none fixed inset-y-0 left-0 z-40"
        style={{ width: railWidth + panelWidth }}
        aria-hidden={!panelVisible}
      >
        {/* painel */}
        <div
          className={[
            "pointer-events-auto h-full border-r border-black/5 bg-white/95 shadow-lg backdrop-blur-md dark:bg-zinc-900/80",
            "transition-transform duration-300 ease-out",
            panelVisible ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          style={{ width: panelWidth, marginLeft: railWidth }}
          onMouseEnter={() => { if (pinned && collapsed && !isMobile) setHoveringRail(true); }}
          onMouseLeave={() => { if (pinned && collapsed && !isMobile) setHoveringRail(false); }}
        >
          {/* Cabeçalho do painel (apenas quando visível) */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="font-semibold">Fitness Pro</div>
            {!pinned && (
              <button
                className="inline-flex h-9 px-3 items-center justify-center rounded-xl border border-black/5 bg-white/70 shadow-sm hover:bg-white transition"
                onClick={closeOverlay}
                aria-label="Fechar"
                title="Fechar"
              >
                Fechar
              </button>
            )}
          </div>

          {/* Lista com textos (mesma ordem do rail) */}
          <nav className="h-[calc(100%-52px)] overflow-y-auto px-2 pb-4">
            {MENU.map((group) => (
              <div key={group.label} className="mb-4">
                <div className="px-2 text-[10px] uppercase tracking-wide text-zinc-400">
                  {group.label}
                </div>
                <ul className="mt-1 space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={[
                            "flex h-10 items-center gap-3 rounded-xl border px-3 transition",
                            active
                              ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30"
                              : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          ].join(" ")}
                          onClick={() => { if (!pinned) closeOverlay(); }}
                        >
                          <Icon>{item.icon}</Icon>
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* backdrop (apenas quando desafixada e aberta) */}
        {!pinned && (
          <div
            role="presentation"
            className={[
              "pointer-events-auto fixed inset-0 z-[-1] bg-black/20 transition-opacity duration-300 ease-out",
              panelVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
            onClick={closeOverlay}
          />
        )}
      </div>
    </>
  );
}
