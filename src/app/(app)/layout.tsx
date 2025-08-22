// src/app/(app)/layout.tsx
import React, { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import RoleSidebar from '@/components/layout/RoleSidebar';
import AppProviders from '@/components/layout/AppProviders';
import './theme.css';

export const dynamic = 'force-dynamic';

// …imports iguais
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>{/* o teu <Script> inicial continua igual */}</head>
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
          {/* aside é apenas o "espaço" do grid; não pode capturar eventos */}
          <aside
            style={{
              gridArea: 'sidebar',
              minHeight: 0,
              borderRight: '1px solid var(--border)',
              pointerEvents: 'none', // <- importante
            }}
          />
          <div style={{ gridArea: 'header' }}>
            <AppHeader />
          </div>
          <main id="app-content" style={{ gridArea: 'main', minWidth: 0, minHeight: 0, padding: 16 }}>
            {children}
          </main>

          {/* O flyout continua a ser renderizado aqui fora do grid */}
          <RoleSidebar />
        </AppProviders>
      </body>
    </html>
  );
}
