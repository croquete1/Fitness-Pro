"use client";

import { useTheme } from "next-themes";

export default function AppHeader() {
  const { theme, setTheme } = useTheme();
  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        {/* Esquerda: barra de pesquisa */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "8px 10px",
              width: "100%",
              maxWidth: 920,
            }}
          >
            <span aria-hidden>🔎</span>
            <input
              placeholder="Pesquisar cliente por nome ou email..."
              style={{ background: "transparent", border: 0, outline: 0, width: "100%" }}
            />
          </div>
        </div>

        {/* Direita */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn icon" aria-label="Notificações" title="Notificações">🔔</button>
          <button className="btn icon" aria-label="Tema" onClick={onToggleTheme} title="Alternar tema">
            {theme === "dark" ? "🌙" : "🌙"}
          </button>
          <a href="/api/auth/signout" className="btn ghost" style={{ paddingInline: 12 }}>
            Terminar sessão
          </a>
        </div>
      </div>
    </header>
  );
}
