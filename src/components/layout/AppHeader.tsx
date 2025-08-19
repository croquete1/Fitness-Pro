"use client";

import React from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";

export default function AppHeader() {
  const { theme, setTheme } = useTheme();

  const onToggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const onSignOut = () => signOut({ callbackUrl: "/login" });

  return (
    <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <button type="button" className="btn icon" aria-label="Notificações" title="Notificações">
        <span>🔔</span>
      </button>

      <button
        type="button"
        className="btn icon"
        onClick={onToggleTheme}
        aria-label="Alternar tema"
        title="Alternar tema"
      >
        <span>{theme === "dark" ? "🌞" : "🌙"}</span>
      </button>

      <button type="button" onClick={onSignOut} className="btn ghost" title="Terminar sessão">
        Terminar sessão
      </button>
    </div>
  );
}
