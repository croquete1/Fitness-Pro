import Script from "next/script";
import AppProviders from "@/components/layout/AppProviders";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import SidebarHoverPeeker from "@/components/layout/SidebarHoverPeeker";
import ClientProviders from "@/components/ui/ClientProviders";
import Hotkeys from "@/components/layout/Hotkeys";
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

    // sidebar (defaults: pinned=1, collapsed=0)
    var collapsed = localStorage.getItem("fp:sb:collapsed");
    var pinned    = localStorage.getItem("fp:sb:pinned");
    var c = collapsed === "1" ? "1" : "0";
    var p = pinned === "0" ? "0" : "1";
    root.setAttribute("data-sb-collapsed", c);
    root.setAttribute("data-sb-pinned",    p);

    // largura atual da coluna usada pelo header/main
    var cs = getComputedStyle(root);
    var w  = cs.getPropertyValue("--sb-width").trim();
    var wc = cs.getPropertyValue("--sb-width-collapsed").trim();
    root.style.setProperty("--sb-col", (p === "1" ? (c === "1" ? wc : w) : wc) || w);
  } catch (e) {}
})();
        `}</Script>
      </head>

      <body className="app-shell">
        {/* Providers globais (NextAuth, Toasts, etc.) */}
        <AppProviders>
          <ClientProviders>
            {/* Sidebar fixa única */}
            <RoleSidebar />
            {/* Peek ao passar o rato quando não está afixada */}
            <SidebarHoverPeeker />

            {/* Header com o wrapper esperado pelo CSS */}
            <header className="app-header">
              <div className="header-inner">
                <AppHeader />
              </div>
            </header>

            <Hotkeys />

            {/* Conteúdo principal: recua com --sb-col */}
            <main id="app-content" role="main">
              {children}
            </main>
          </ClientProviders>
        </AppProviders>
      </body>
    </html>
  );
}
