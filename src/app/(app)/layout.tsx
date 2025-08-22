import React, { ReactNode } from "react";
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import AppProviders from "@/components/layout/AppProviders";
import SidebarProvider from "@/components/SidebarWrapper";
import "./theme.css";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        <Script id="init-preferences" strategy="beforeInteractive">{`
(function () {
  try {
    var root = document.documentElement;
    var theme = localStorage.getItem("theme");
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
    var collapsed = localStorage.getItem("fp:sb:collapsed");
    var pinned    = localStorage.getItem("fp:sb:pinned");
    root.setAttribute("data-sb-collapsed", collapsed === "1" ? "1" : "0");
    root.setAttribute("data-sb-pinned",    pinned === "1" ? "1" : "0");
    var cs = getComputedStyle(root);
    root.style.setProperty("--sb-col",
      (collapsed === "1" ? cs.getPropertyValue("--sb-width-collapsed") : cs.getPropertyValue("--sb-width")).trim()
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
        <SidebarProvider>
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
        </SidebarProvider>
      </body>
    </html>
  );
}
