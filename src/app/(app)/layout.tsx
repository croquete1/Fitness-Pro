import React, { ReactNode } from "react";
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar"; // ← caminho correto
import "./theme.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
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
          gridTemplateColumns: "var(--sb-width, 264px) 1fr",
          gridTemplateRows: "auto 1fr",
          gridTemplateAreas: `"sidebar header" "sidebar main"`,
        }}
      >
        <aside style={{ gridArea: "sidebar", minHeight: 0, borderRight: "1px solid var(--border)" }}>
          <RoleSidebar />
        </aside>

        <div style={{ gridArea: "header" }}>
          <AppHeader />
        </div>

        <main id="app-content" style={{ gridArea: "main", minWidth: 0, minHeight: 0, padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
