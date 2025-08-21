// src/app/(app)/layout.tsx
import React, { ReactNode } from "react";
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import AppProviders from "@/components/layout/AppProviders";
import "./theme.css";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* Inicializa tema e estado da sidebar ANTES de hidratar */}
        <Script id="init-preferences" strategy="beforeInteractive">{`
(function () {
  try {
    var root = document.documentElement;

    // sidebar: colapsada / afixada
    var c = localStorage.getItem("fp:sb:collapsed");
    root.setAttribute("data-sb-collapsed", (c === "1" || c === "true") ? "1" : "0");

    var p = localStorage.getItem("fp:sb:pinned");
    root.setAttribute("data-sb-pinned", (p === "1" || p === "true") ? "1" : "0");

    // tema
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
          // a largura da coluna da sidebar vem de --sb-col que o CSS atualiza consoante o estado
          gridTemplateColumns: "var(--sb-col, var(--sb-width)) 1fr",
          gridTemplateRows: "auto 1fr",
          gridTemplateAreas: `"sidebar header" "sidebar main"`,
        }}
      >
        <AppProviders>
          <aside style={{ gridArea: "sidebar", minHeight: 0, borderRight: "1px solid var(--border)" }}>
            <RoleSidebar />
          </aside>

          <div style={{ gridArea: "header" }}>
            <AppHeader />
          </div>

          <main id="app-content" style={{ gridArea: "main", minWidth: 0, minHeight: 0, padding: 16 }}>
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
