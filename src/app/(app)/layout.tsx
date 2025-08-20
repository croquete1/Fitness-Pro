import React, { ReactNode } from "react";
import Script from "next/script";
import AppHeader from "@/components/layout/AppHeader";
// ⬇️ Atualizado: importa RoleSidebar diretamente de src/components/
import RoleSidebar from "@/components/RoleSidebar";
import "./theme.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        <Script id="init-preferences" strategy="beforeInteractive">{`(function(){try{var r=document.documentElement;var s=localStorage.getItem("sb-collapsed");if(s==="true"||s==="false")r.setAttribute("data-sb-collapsed",s);var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){r.setAttribute("data-theme",t);}else{var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;r.setAttribute("data-theme",d?"dark":"light");}}catch(e){}})();`}</Script>
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
