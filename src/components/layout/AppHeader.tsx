"use client";

import React from "react";
import { signOut } from "next-auth/react";
import HeaderSearch from "./HeaderSearch";
import SbToggle from "./SbToggle";

/**
 * Ações: notificações, tema, terminar sessão.
 * Nota: sem dependências externas; o tema é guardado em localStorage ("theme": "light" | "dark")
 * e reflectido em <html data-theme="..."> para ser compatível com o teu globals.css.
 */
export default function AppHeader() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const mounted = React.useRef(false);

  React.useEffect(() => {
    // Ler tema inicial
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        // fallback: respeitar prefers-color-scheme
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "light";
        setTheme(initial);
        document.documentElement.setAttribute("data-theme", initial);
      }
    } catch {
      /* noop */
    }
    mounted.current = true;
  }, []);

  function toggleTheme() {
    const next: "light" | "dark" = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* noop */
    }
    document.documentElement.setAttribute("data-theme", next);
  }

  function handleSignOut() {
    // Redirecciona para a homepage ao terminar sessão
    void signOut({ callbackUrl: "/" });
  }

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        height: 56,
        padding: "0 12px",
        borderBottom: "1px solid var(--border, #e5e5e5)",
        background: "var(--header-bg, #fff)",
        backdropFilter: "saturate(120%) blur(6px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
        <SbToggle />
        <HeaderSearch />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Notificações (placeholder) */}
        <button
          type="button"
          title="Notificações"
          aria-label="Notificações"
          onClick={() => {
            // Placeholder: podes substituir por um menu/popover de notificações
            console.log("Abrir notificações");
          }}
          style={btnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M13.73 21a2 2 0 01-3.46 0" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        {/* Tema */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          aria-label="Alternar tema"
          style={btnStyle}
        >
          {theme === "dark" ? (
            // Ícone lua
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          ) : (
            // Ícone sol
            <svg width="18" height="18" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5L19 19M5 19l-1.5 1.5M20.5 3.5L19 5" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>

        {/* Terminar sessão */}
        <button
          type="button"
          onClick={handleSignOut}
          title="Terminar sessão"
          aria-label="Terminar sessão"
          style={btnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M10 17l5-5-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 12H3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M21 21V3" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </header>
  );
}

const btnStyle: React.CSSProperties = {
  height: 36,
  width: 36,
  borderRadius: 8,
  border: "1px solid var(--border, #dcdcdc)",
  background: "var(--btn-bg, #fff)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
