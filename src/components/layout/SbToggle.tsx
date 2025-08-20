"use client";

import React from "react";

/**
 * Botão para compactar/expandir a sidebar.
 * Persiste o estado em localStorage e reflecte em <html data-sb-collapsed="true|false">
 */
export default function SbToggle() {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  // Ler estado inicial (evita "flash" ao montar)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("sb-collapsed");
      const fromAttr =
        document.documentElement.getAttribute("data-sb-collapsed");
      const initial =
        saved === "true"
          ? true
          : saved === "false"
          ? false
          : fromAttr === "true";
      setCollapsed(initial);
      document.documentElement.setAttribute("data-sb-collapsed", String(initial));
    } catch {
      /* noop */
    }
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("sb-collapsed", String(next));
    } catch {
      /* noop */
    }
    document.documentElement.setAttribute("data-sb-collapsed", String(next));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={collapsed}
      title={collapsed ? "Expandir sidebar" : "Compactar sidebar"}
      aria-label={collapsed ? "Expandir sidebar" : "Compactar sidebar"}
      style={{
        height: 36,
        width: 36,
        borderRadius: 8,
        border: "1px solid var(--border, #dcdcdc)",
        background: "var(--btn-bg, #fff)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {/* Ícone alterna conforme estado */}
      {collapsed ? (
        // ChevronsRight
        <svg width="18" height="18" viewBox="0 0 24 24">
          <polyline
            points="9 18 15 12 9 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="5 18 11 12 5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // ChevronsLeft
        <svg width="18" height="18" viewBox="0 0 24 24">
          <polyline
            points="15 18 9 12 15 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="19 18 13 12 19 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
