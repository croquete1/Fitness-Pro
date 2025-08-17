"use client";

import React from "react";
import { signOut } from "next-auth/react";

function applyTheme(t: "dark" | "light") {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", t);
  }
}

export default function AppHeader() {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("fp-theme")) as
      | "dark"
      | "light"
      | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") localStorage.setItem("fp-theme", next);
    applyTheme(next);
  }

  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <strong>Dashboard</strong>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn ghost" type="button" aria-label="Notificações">
          🔔
        </button>
        <button
          className="btn ghost"
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          title={theme === "dark" ? "Mudar para claro" : "Mudar para escuro"}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Terminar sessão
        </button>
      </div>
    </header>
  );
}
