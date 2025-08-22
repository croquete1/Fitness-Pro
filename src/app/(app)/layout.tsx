// src/app/(app)/layout.tsx
import React, { ReactNode } from 'react';
import Script from 'next/script';
import AppHeader from '@/components/layout/AppHeader';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppProviders from '@/components/layout/AppProviders';
import './theme.css';
import '@/components/layout/sidebar.css';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        {/* aplicar tema + estado sidebar (persistido) antes de hidratar */}
        <Script id="init-preferences" strategy="beforeInteractive">{`
(function () {
  try {
    var root = document.documentElement;

    var theme = localStorage.getItem("theme");
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      var prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }

    var collapsed = localStorage.getItem("fp:sb:collapsed");
    var pinned    = localStorage.getItem("fp:sb:pinned");
    var isCollapsed = collapsed === "1";
    var isPinned    = pinned === "1" && !isCollapsed;

    root.setAttribute("data-sb-collapsed", isCollapsed ? "1" : "0");
    root.setAttribute("data-sb-pinned",    isPinned ? "1" : "0");

    var styles = getComputedStyle(root);
    var expanded = styles.getPropertyValue('--sb-width').trim();
    var sliced   = styles.getPropertyValue('--sb-width-collapsed').trim();
    root.style.setProperty('--sb-col', isCollapsed ? sliced : expanded);
  } catch (e) {}
})();
        `}</Script>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: 'var(--sb-col, var(--sb-width)) 1fr',
          gridTemplateRows: 'auto 1fr',
          gridTemplateAreas: `"sidebar header" "sidebar main"`,
          transition: 'grid-template-columns 260ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <AppProviders>
          <aside style={{ gridArea: 'sidebar', minHeight: 0 }}>
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
