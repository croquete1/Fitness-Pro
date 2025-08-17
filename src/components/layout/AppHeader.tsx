"use client";

import React from "react";
import { signOut } from "next-auth/react";
import useSidebarState from "../SidebarWrapper";          // <- já existe
import { useTheme } from "@/app/providers";               // <- fornecido no providers.tsx

export default function AppHeader() {
  const { toggleCollapsed } = useSidebarState();
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="fp-header" role="banner">
      <div className="fp-header-inner">
        {/* Esquerda: botão sidebar + pesquisa */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <button
            type="button"
            className="btn icon ghost"
            onClick={toggleCollapsed}
            aria-label="Alternar sidebar"
            title="Alternar sidebar"
          >
            ☰
          </button>

          <input
            type="search"
            placeholder="Pesquisar cliente por nome ou email..."
            aria-label="Pesquisar"
            style={{
              width: "100%",
              maxWidth: 560,
              minWidth: 200,
            }}
          />
        </div>

        {/* Direita: ações */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="btn icon ghost"
            aria-label="Notificações"
            title="Notificações"
          >
            🔔
          </button>

          <button
            type="button"
            className="btn icon ghost"
            onClick={onToggleTheme}
            aria-pressed={theme === "dark"}
            title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {theme === "dark" ? "🌙" : "🌞"}
          </button>

          <button
            type="button"
            className="btn ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Terminar sessão"
          >
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
