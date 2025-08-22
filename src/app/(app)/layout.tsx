// src/app/(app)/layout.tsx
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import AppProviders from "@/components/layout/AppProviders";
import SidebarHoverPeeker from "@/components/layout/SidebarHoverPeeker";
import "./theme.css";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* Aplica tema + estado da sidebar antes de hidratar */}
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

    // ---- sidebar (collapsed/pinned) com fallback seguro
    var lsCollapsed = localStorage.getItem("fp:sb:collapsed");
    var lsPinned    = localStorage.getItem("fp:sb:pinned");
    var isCollapsed = lsCollapsed === "1";
    var isPinned    = lsPinned === "1" && !isCollapsed; // se colapsada, não fica afixada

    root.setAttribute("data-sb-collapsed", isCollapsed ? "1" : "0");
    root.setAttribute("data-sb-pinned",    isPinned ? "1" : "0");

    // coluna do grid (--sb-col)
    var cs = getComputedStyle(root);
    var w  = (cs.getPropertyValue("--sb-width") || "264px").trim();
    var wc = (cs.getPropertyValue("--sb-width-collapsed") || "72px").trim();
    root.style.setProperty("--sb-col", (isCollapsed && !isPinned) ? wc : w);
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
        <AppProviders>
          {/* O aside é apenas o espaço do grid; não deve bloquear o hover */}
          <aside
            style={{
              gridArea: "sidebar",
              minHeight: 0,
              borderRight: "1px solid var(--border)",
              pointerEvents: "none",
              position: "relative",
              zIndex: 0,
            }}
          >
            {/* A flyout é fixed e tem z-index alto; permanece clicável */}
            <RoleSidebar />
          </aside>

          {/* Faixa invisível que activa o “peek” ao encostar o rato */}
          <SidebarHoverPeeker />

          <div className="app-header" style={{ gridArea: "header", position: "relative", zIndex: 20 }}>
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
