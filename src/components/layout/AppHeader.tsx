"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useSidebarState } from "../SidebarWrapper";

export default function AppHeader() {
  // apenas o que usamos (evita o erro do ESLint)
  const { toggleCollapsed, openOverlay } = useSidebarState();
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () =>
    setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* hambúrguer também no header se precisares (opcional).
              Continua funcional: recolhe/expande a sidebar afixada e,
              se estiver em modo overlay, força o abrir. */}
          <button
            className="btn icon"
            aria-label="Menu"
            onClick={() => {
              openOverlay();
              toggleCollapsed(); // comporta-se bem quando está afixada
            }}
          >
            ≡
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn icon" aria-label="Notificações">🔔</button>
          <button
            className="btn icon"
            aria-label="Alternar tema"
            onClick={onToggleTheme}
          >
            🌙
          </button>
          <a className="btn ghost" href="/api/auth/signout">
            Terminar sessão
          </a>
        </div>
      </div>
    </header>
  );
}
