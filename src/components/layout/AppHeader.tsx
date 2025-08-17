"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useSidebarState } from "../SidebarWrapper";

export default function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { pinned, collapsed, toggleCollapsed, openOverlay } = useSidebarState();

  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className="fp-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40, // acima do scrim/overlay
        background: "color-mix(in oklab, var(--bg) 88%, var(--card) 12%)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "saturate(140%) blur(6px)",
      }}
    >
      <div
        className="fp-header-inner"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
        }}
      >
        {/* Esquerda: “menu” (abre overlay se não estiver pinned; senão alterna rail/expandido) + search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            className="btn icon"
            aria-label="Abrir menu"
            onClick={() => (pinned ? toggleCollapsed() : openOverlay())}
            title="Menu"
          >
            {/* hambúrguer simples */}
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* o teu input/search aqui (placeholder para não romper layout) */}
          <div
            style={{
              flex: 1,
              minWidth: 160,
              height: 36,
              border: "1px solid var(--border)",
              background: "var(--card)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              color: "var(--muted-fg)",
            }}
          >
            Pesquisar cliente por nome ou email…
          </div>
        </div>

        {/* Direita: tema + terminar sessão (sempre visíveis) */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <button className="btn icon" onClick={onToggleTheme} title="Tema">
            {theme === "dark" ? "🌙" : "🌞"}
          </button>

          <button className="btn ghost" title="Terminar sessão">
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
