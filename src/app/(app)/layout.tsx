// src/app/(app)/layout.tsx
import React, { ReactNode } from "react";
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import AppProviders from "@/components/layout/AppProviders";
import SidebarProvider from "@/components/SidebarWrapper"; // <= garante contexto da sidebar
import "./theme.css";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* Inicializa tema + estado da sidebar ANTES de hidratar */}
        <Script id="init-preferences" strategy="beforeInteractive">{`
(function () {
  try {
    var root = document.documentElement;

    // ---- tema
    var theme = localStorage.getItem("theme");
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }

    // ---- sidebar (atributos + largura da coluna)
    var collapsed = localStorage.getItem("fp:sb:collapsed") === "1";
    var pinned    = localStorage.getItem("fp:sb:pinned") === "1";

    // não pode estar 'pinned' se estiver colapsada
    if (collapsed && pinned) pinned = false;

    root.setAttribute("data-sb-collapsed", collapsed ? "1" : "0");
    root.setAttribute("data-sb-pinned", pinned ? "1" : "0");

    // define a largura real lida pela grid (fallback visual imediato)
    var cs = getComputedStyle(root);
    root.style.setProperty("--sb-col", collapsed ? cs.getPropertyValue("--sb-width-collapsed").trim()
                                                 : cs.getPropertyValue("--sb-width").trim());
  } catch (e) {}
})();
        `}</Script>
      </head>

      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          // ⚠️ a grid lê SEMPRE --sb-col; theme.css troca o valor com data-sb-collapsed
          gridTemplateColumns: "var(--sb-col, var(--sb-width)) 1fr",
          gridTemplateRows: "auto 1fr",
          gridTemplateAreas: `"sidebar header" "sidebar main"`,
        }}
      >
        {/* Providers globais (Session, etc.) */}
        <AppProviders>
          {/* Provider específico da Sidebar (contexto de colapso/pin) */}
          <SidebarProvider>
            <aside style={{ gridArea: "sidebar", minHeight: 0, borderRight: "1px solid var(--border)" }}>
              <RoleSidebar />
            </aside>

            <div style={{ gridArea: "header" }}>
              <AppHeader />
            </div>

            <main id="app-content" style={{ gridArea: "main", minWidth: 0, minHeight: 0, padding: 16 }}>
              {children}
            </main>
          </SidebarProvider>
        </AppProviders>
      </body>
    </html>
  );
}
