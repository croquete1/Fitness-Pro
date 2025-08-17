"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
// ✅ usar o HOOK como named import (não o default)
import { useSidebarState } from "../SidebarWrapper";

export default function AppHeader() {
  const { toggleCollapsed, setOverlayOpen } = useSidebarState();
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () =>
    setTheme(theme === "dark" ? "light" : "dark");

  const onToggleSidebar = () => {
    toggleCollapsed();
    // abre/fecha overlay consoante o teu provider (não dispara warning porque é usado)
    setOverlayOpen(false);
  };

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="btn icon"
            onClick={onToggleSidebar}
            title="Expandir/Encolher sidebar"
            aria-label="Alternar sidebar"
          >
            ☰
          </button>

          <input
            aria-label="Pesquisar cliente por nome ou email..."
            placeholder="Pesquisar cliente por nome ou email..."
            className="auth-input"
            style={{ width: "min(520px, 60vw)" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="btn icon"
            title="Notificações"
            aria-label="Notificações"
          >
            🔔
          </button>

          <button
            type="button"
            className="btn icon"
            onClick={onToggleTheme}
            title="Alternar tema"
            aria-pressed={theme === "dark"}
          >
            {theme === "dark" ? "🌙" : "🌞"}
          </button>

          <button
            type="button"
            className="btn ghost"
            onClick={() => signOut()}
            title="Terminar sessão"
          >
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
