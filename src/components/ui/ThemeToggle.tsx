"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // tentar ler do localStorage ou do atributo existente
    try {
      const stored = (localStorage.getItem("theme") as Theme | null) ?? null;
      const attr = document.documentElement.getAttribute("data-theme") as Theme | null;
      const initial: Theme = stored ?? attr ?? "light";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {
      /* no-op */
    }
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
      } catch { /* no-op */ }
      return next;
    });
  };

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={toggle}
      className="pill"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
      }}
    >
      <span aria-hidden style={{ fontSize: 14 }}>
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
      <span className="text-muted" style={{ fontSize: 12 }}>
        {theme === "dark" ? "Escuro" : "Claro"}
      </span>
    </button>
  );
}
