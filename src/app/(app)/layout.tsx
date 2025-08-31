// src/app/(app)/layout.tsx
import Script from "next/script";
import AppProviders from "@/components/layout/AppProviders";
import AppHeader from "@/components/layout/AppHeader";
import RoleSidebar from "@/components/layout/RoleSidebar";
import SidebarHoverPeeker from "@/components/layout/SidebarHoverPeeker";
import ToastsProvider from "@/components/ui/Toasts";

// CSS do tema (certifica-te que existe)
import "./theme.css";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* Inicializa theme + estado da sidebar ANTES de pintar */}
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
        {/* Provider de toasts a envolver tudo */}
        <ToastsProvider>
          <AppProviders>
            {/* Sidebar fixa (única) */}
            <RoleSidebar />
            {/* Zona de hover para “peek” quando não está afixada */}
            <SidebarHoverPeeker />

            {/* Header fixo */}
            <header className="app-header">
              <AppHeader />
            </header>

            {/* Conteúdo recuado pela sidebar */}
            <main id="app-content">{children}</main>
          </AppProviders>
        </ToastsProvider>
      </body>
    </html>
  );
}
