"use client";

import { useTheme } from "next-themes";
import { useSidebarState } from "@/components/SidebarWrapper";

export default function AppHeader() {
  const { toggleCollapsed } = useSidebarState();
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        {/* Esquerda */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Este botão só aparece em modo "rail" (css controla a visibilidade) */}
          <button
            className="btn icon btn-toggle--header"
            aria-label="Alternar sidebar"
            onClick={toggleCollapsed}
            title="Alternar sidebar"
          >
            ☰
          </button>

          {/* Search slot – mantém simples para não quebrar nada */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "8px 10px",
              }}
            >
              <span aria-hidden>🔎</span>
              <input
                placeholder="Pesquisar cliente por nome ou email..."
                style={{ background: "transparent", border: 0, outline: 0, width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Direita */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn icon" aria-label="Notificações" title="Notificações">🔔</button>
          <button className="btn icon" aria-label="Tema" onClick={onToggleTheme} title="Alternar tema">
            {theme === "dark" ? "🌙" : "🌙"}
          </button>

          {/* Usa o teu fluxo real de logout (NextAuth, etc.) */}
          <a href="/api/auth/signout" className="btn ghost" style={{ paddingInline: 12 }}>
            Terminar sessão
          </a>
        </div>
      </div>
    </header>
  );
}
