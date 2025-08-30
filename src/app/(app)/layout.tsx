import Script from "next/script";
import AppProviders from "@/components/layout/AppProviders";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import SidebarHoverPeeker from "@/components/layout/SidebarHoverPeeker";
import ClientProviders from "@/components/ui/ClientProviders";
import HotKeys from "@/components/layout/HotKeys";
import "./theme.css";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* Inicializa tema + estado da sidebar ANTES de pintar */}
        <Script id="init-preferences" strategy="beforeInteractive">{`
(function () {
  try {
    var root = document.documentElement;
    // tema
    var theme = localStorage.getItem("theme");
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
    // sidebar
    var collapsed = localStorage.getItem("fp:sb:collapsed");
    var pinned    = localStorage.getItem("fp:sb:pinned");
    root.setAttribute("data-sb-collapsed", collapsed === "1" ? "1" : "0");
    root.setAttribute("data-sb-pinned",    pinned === "1" ? "1" : "0");
    // largura atual da coluna usada pelo header/main
    var cs = getComputedStyle(root);
    var w  = cs.getPropertyValue("--sb-width").trim();
    var wc = cs.getPropertyValue("--sb-width-collapsed").trim();
    root.style.setProperty("--sb-col", (pinned === "1" ? (collapsed === "1" ? wc : w) : wc) || w);
  } catch (e) {}
})();
        `}</Script>
      </head>

      <body className="app-shell">
        <AppProviders>
          <ClientProviders>
            {/* Sidebar FIXED (única) */}
            <RoleSidebar />
            {/* Zona de hover para “peek” quando não está afixada */}
            <SidebarHoverPeeker />

            {/* Header no formato que o CSS espera */}
            <header className="app-header">
              <div className="header-inner">
                <AppHeader />
              </div>
            </header>

            {/* Atalhos globais */}
            <HotKeys />

            {/* UM único main que recua com --sb-col */}
            <main id="app-content" className="app-main">
              {children}
            </main>
          </ClientProviders>
        </AppProviders>
      </body>
    </html>
  );
}
