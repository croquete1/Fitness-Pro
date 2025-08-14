"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Lê do localStorage ou do sistema
    const saved = (typeof window !== "undefined" && localStorage.getItem("fp_theme")) as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
      return;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const initTheme: Theme = prefersDark ? "dark" : "light";
    setTheme(initTheme);
    document.documentElement.setAttribute("data-theme", initTheme);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("fp_theme", next);
  };

  // Ícones inline (sem dependências)
  const Sun = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10-9h-2v3h2V4zm7.45 1.46l-1.41-1.41-1.8 1.79 1.41 1.41 1.8-1.79zM17 13h3v-2h-3v2zm-5 7h2v-3h-2v3zm6.24-1.84l1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42zM4.22 18.36l1.8-1.79-1.42-1.42-1.79 1.8 1.41 1.41zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>
  );
  const Moon = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M12.4 2c.38 0 .75.03 1.11.1A8.99 8.99 0 0021 12a9 9 0 01-9 9 9 9 0 01-8.9-7.49c.35.05.71.08 1.08.08A8 8 0 0012.4 2z"/>
    </svg>
  );

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar tema"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: ".5rem",
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: "999px",
        padding: ".4rem .7rem",
        cursor: "pointer",
      }}
    >
      {theme === "dark" ? Sun : Moon}
      <span style={{ fontSize: ".9rem" }}>{theme === "dark" ? "Claro" : "Escuro"}</span>
    </button>
  );
}
