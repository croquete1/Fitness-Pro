// src/app/(app)/layout.tsx
import React, { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppProviders from '@/components/layout/AppProviders';
import './theme.css';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        <script
          id="init-preferences"
          dangerouslySetInnerHTML={{
            __html: `
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
    var widthVar = getComputedStyle(root).getPropertyValue(
      collapsed === "1" ? "--sb-width-collapsed" : "--sb-width"
    ).trim();
    root.style.setProperty("--sb-col", widthVar);
    root.setAttribute("data-sb-collapsed", collapsed === "1" ? "1" : "0");
    var pinned = localStorage.getItem("fp:sb:pinned");
    root.setAttribute("data-sb-pinned", pinned === "1" ? "1" : "0");
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: 'var(--sb-col, var(--sb-width)) 1fr',
          gridTemplateRows: 'auto 1fr',
          gridTemplateAreas: `"sidebar header" "sidebar main"`,
        }}
      >
        <AppProviders>
          <aside style={{ gridArea: 'sidebar', minHeight: 0, borderRight: '1px solid var(--border)' }}>
            <RoleSidebar />
          </aside>

          <div style={{ gridArea: 'header' }}>
            <AppHeader />
          </div>

          <main id="app-content" style={{ gridArea: 'main', minWidth: 0, minHeight: 0, padding: 16 }}>
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
