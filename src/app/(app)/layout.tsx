// src/app/(app)/layout.tsx
import React, { ReactNode } from "react";
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import AppProviders from "@/components/layout/AppProviders";
import SidebarProvider from "@/components/SidebarWrapper"; // ← PROVIDER DA SIDEBAR
import "./theme.css";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* aplica tema + estado persistido da sidebar ANTES de pintar */}
        <Script id="init-preferences" strategy="beforeInteractive">{`
(function () {
  try {
    var root = document.documentElement;
    // theme
    var theme = localStorage.getItem("theme");
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
    // sidebar (valores persistidos)
    var collapsed = localStorage.getItem("fp:sb:collapsed");
    var pinned    = localStorage.getItem("fp:sb:pinned");
    root.setAttribute("data-sb-collapsed", collapsed === "1" ? "1" : "0");
    root.setAttribute("data-sb-pinned",    pinned === "1" ? "1" : "0");
    // variável de coluna do grid
    var styles = getComputedStyle(root);
    root.style.setProperty(
      "--sb-col",
      (collapsed === "1" ? styles.getPropertyValue("--sb-width-collapsed") : styles.getPropertyValue("--sb-width")).trim()
    );
  } catch (e) {}
})();
        `}</Script>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "var(--sb-col, var(--sb-width)) 1fr",
          gridTemplateRows: "auto 1fr",
          gridTemplateAreas: `"sidebar header" "sidebar main"`,
        }}
      >
        {/* Providers globais (Session, Theme, etc.) */}
        <AppProviders>
          {/* Provider da Sidebar TEM de envolver RoleSidebar e qualquer consumidor de useSidebar */}
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
