"use client";

import React from "react";
import { useTheme } from "next-themes";

export default function AppHeader() {
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        {/* (Esquerda) espaço para search / breadcrumbs (mantém o que já tens) */}
        <div />
        {/* (Direita) ações */}
        <div style={{ display: "inline-flex", gap: 8 }}>
          <button className="btn icon" title="Notificações">🔔</button>
          <button className="btn icon" onClick={onToggleTheme} title="Tema">
            {theme === "dark" ? "🌙" : "🌞"}
          </button>
          {/* Botão terminar sessão mantido na tua UI existente */}
        </div>
      </div>
    </header>
  );
}
