"use client";

import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import React from "react";
import { useSidebar } from "../SidebarProvider"; // ⬅️ mantém como está no teu projeto

export default function AppHeader() {
  const { toggleCollapsed } = useSidebar();
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className="fp-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        height: 64, // altura explícita
        backdropFilter: "saturate(180%) blur(8px)",
        WebkitBackdropFilter: "saturate(180%) blur(8px)",
        background:
          "color-mix(in oklab, var(--background) 92%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="fp-header-row"
        style={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 12,
          paddingInline: 16,
          maxWidth: "1440px",
          marginInline: "auto",
        }}
      >
        {/* Botão hamburguer (dentro da sidebar, mas acessível no header também) */}
        <button
          type="button"
          className="btn icon"
          aria-label="Alternar sidebar"
          onClick={toggleCollapsed}
          style={{
            width: 36,
            height: 36,
            display: "inline-grid",
            placeItems: "center",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--muted)",
          }}
        >
          <span aria-hidden>☰</span>
        </button>

        {/* Pesquisa (placeholder – mantém o teu input real aqui) */}
        <div
          style={{
            height: 40,
            display: "grid",
            alignItems: "center",
            border: "1px solid var(--border)",
            borderRadius: 12,
            paddingInline: 12,
            background: "var(--background)",
          }}
        >
          <input
            placeholder="Pesquisar cliente por nome ou email..."
            aria-label="Pesquisar"
            style={{
              outline: "none",
              border: "none",
              background: "transparent",
              width: "100%",
              fontSize: 14,
            }}
          />
        </div>

        {/* Ações à direita */}
        <div
          className="fp-header-actions"
          style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
        >
          <button
            type="button"
            className="btn icon"
            aria-label="Notificações"
            title="Notificações"
            style={iconBtnStyle}
          >
            <span aria-hidden>🔔</span>
          </button>

          <button
            type="button"
            className="btn icon"
            aria-label="Alternar tema"
            title="Alternar tema"
            onClick={onToggleTheme}
            style={iconBtnStyle}
          >
            <span aria-hidden>🌙</span>
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => signOut()}
            style={{
              height: 36,
              padding: "0 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--muted)",
              fontWeight: 600,
            }}
          >
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  display: "inline-grid",
  placeItems: "center",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--muted)",
};
