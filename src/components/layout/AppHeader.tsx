"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

export default function AppHeader() {
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        {/* Área esquerda: pesquisa (placeholder simples) */}
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--card)",
              padding: "8px 10px",
              maxWidth: 520,
            }}
          >
            <span aria-hidden>🔎</span>
            <input
              placeholder="Pesquisar cliente por nome ou email..."
              style={{
                border: 0,
                outline: "none",
                background: "transparent",
                padding: 0,
              }}
            />
          </div>
        </div>

        {/* Área direita: ações */}
        <div style={{ display: "inline-flex", gap: 6 }}>
          <button className="btn icon" aria-label="Notificações" title="Notificações">
            🔔
          </button>
          <button
            className="btn icon"
            onClick={onToggleTheme}
            aria-label="Alternar tema"
            title="Alternar tema"
          >
            {theme === "dark" ? "🌙" : "🌞"}
          </button>
          <button className="btn ghost" onClick={() => signOut()} title="Terminar sessão">
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
