"use client";

import React from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";

export default function AppHeader() {
  const { theme, setTheme } = useTheme();
  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="fp-header" role="banner" aria-label="Cabeçalho">
      <div className="fp-header-inner">
        {/* Esquerda vazia – o botão de menu vive na sidebar */}
        <div />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn icon" aria-label="Notificações">🔔</button>
          <button
            className="btn icon"
            onClick={onToggleTheme}
            aria-label="Alternar tema"
            title="Tema"
          >
            {theme === "dark" ? "🌙" : "🌞"}
          </button>
          <button className="btn" onClick={() => signOut()}>
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
