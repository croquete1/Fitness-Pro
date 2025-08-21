import React, { ReactNode } from "react";
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import AppProviders from "@/components/layout/AppProviders";
import TimezoneCookie from "@/components/layout/TimezoneCookie";
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

    // Sidebar (compatível com o teu SidebarWrapper: "1" | "0")
    var sb = localStorage.getItem("fp:sb:collapsed");
    if (sb === "1" || sb === "0") root.setAttribute("data-sb-collapsed", sb);
    var pin = localStorage.getItem("fp:sb:pinned");
    if (pin === "1" || pin === "0") root.setAttribute("data-sb-pinned", pin);

    // Tema
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
          gridTemplateColumns: "var(--sb-rail, 264px) 1fr", // rail da sidebar (64px quando colapsada)
          gridTemplateRows: "auto 1fr",
          gridTemplateAreas: `"sidebar header" "sidebar main"`,
        }}
      >
        <AppProviders>
          {/* A sidebar fixa desenha o painel; o <aside> apenas reserva o rail na grid */}
          <aside style={{ gridArea: "sidebar" }} aria-hidden="true">
            <RoleSidebar />
          </aside>

          <div
            style={{
              gridArea: "header",
              position: "sticky",
              top: 0,
              zIndex: 120, // a sidebar usa 200 no CSS
            }}
          >
            <AppHeader />
          </div>

          <main
            id="app-content"
            style={{ gridArea: "main", minWidth: 0, minHeight: 0, padding: 16 }}
          >
            {children}
          </main>

          {/* define cookies de timezone no 1º render do cliente */}
          <TimezoneCookie />
        </AppProviders>
      </body>
    </html>
  );
}
