import React, { ReactNode } from "react";
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
import Sidebar from "@/components/Sidebar"; // assumir que já existe no teu projeto

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* Inicialização precoce: aplica tema e estado da sidebar antes da hidratação para evitar "flash" */}
        <Script id="init-preferences" strategy="beforeInteractive">{`
(function () {
  try {
    var root = document.documentElement;
    var sb = localStorage.getItem("sb-collapsed");
    if (sb === "true" || sb === "false") root.setAttribute("data-sb-collapsed", sb);

    var theme = localStorage.getItem("theme");
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  } catch (e) {}
})();
        `}</Script>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns:
            "var(--sb-width, 260px) 1fr", // deixa o teu globals.css controlar via [data-sb-collapsed]
          gridTemplateRows: "auto 1fr",
          gridTemplateAreas: `
            "sidebar header"
            "sidebar main"
          `,
        }}
      >
        <aside style={{ gridArea: "sidebar", minHeight: 0, borderRight: "1px solid var(--border, #e5e5e5)" }}>
          {/* A tua Sidebar existente */}
          <Sidebar />
        </aside>

        <div style={{ gridArea: "header" }}>
          <AppHeader />
        </div>

        <main
          id="app-content"
          style={{
            gridArea: "main",
            minWidth: 0,
            minHeight: 0,
            padding: 16,
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
