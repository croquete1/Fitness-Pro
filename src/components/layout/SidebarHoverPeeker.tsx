// src/components/layout/SidebarHoverPeeker.tsx
"use client";

/**
 * Uma faixa invisível na esquerda que, ao aproximar o rato,
 * activa data-sb-peek="1" no <html>. Assim a flyout abre mesmo
 * que outro elemento esteja por cima do slice.
 */
export default function SidebarHoverPeeker() {
  return (
    <div
      aria-hidden
      onMouseEnter={() =>
        document.documentElement.setAttribute("data-sb-peek", "1")
      }
      onMouseLeave={() =>
        document.documentElement.removeAttribute("data-sb-peek")
      }
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: "var(--sb-width-collapsed)", // zona de activação
        zIndex: 9998,
        pointerEvents: "auto",
        background: "transparent",
      }}
    />
  );
}
