import type { ReactNode } from "react";
import Script from "next/script";
import SidebarProvider from "@/components/SidebarWrapper";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Aplica a preferência (collapsed/pinned) ANTES da hidratação → evita "salto" */}
      <Script id="fp-sb-boot" strategy="beforeInteractive">{`
        try {
          const raw = localStorage.getItem('fp:sidebar');
          const pref = raw ? JSON.parse(raw) : {};
          const collapsed = !!pref?.collapsed;
          const pinned = !!pref?.pinned;

          document.documentElement.dataset.sbCollapsed = collapsed ? '1' : '0';
          document.documentElement.dataset.sbPinned    = pinned ? '1' : '0';
          // Largura precoz (usa as mesmas que estão no CSS)
          document.documentElement.style.setProperty('--sb-w', collapsed ? '64px' : '260px');
        } catch (_) {}
      `}</Script>

      <SidebarProvider>
        <div className="fp-shell" style={{ display: "grid", minHeight: "100dvh" }}>
          <Sidebar />
          <main className="fp-main">
            <AppHeader />
            {children}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}