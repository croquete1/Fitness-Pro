import React from "react";
import Providers from "@/app/providers";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";
import { SidebarProvider, useSidebarState } from "@/components/SidebarWrapper";

function Shell({ children }: { children: React.ReactNode }) {
  const { pinned, collapsed } = useSidebarState();

  // largura reservada para a coluna APENAS quando afixada
  const sbw = pinned ? (collapsed ? 72 : 260) : 0;

  return (
    <div
      className="fp-shell"
      style={{ gridTemplateColumns: `${sbw}px 1fr` }}
    >
      {/* Quando desafixada, a Sidebar já está em fixed,
          mas mantém-se aqui para o modo afixado */}
      <Sidebar />
      <main className="fp-main">
        <AppHeader />
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider>
        <Shell>{children}</Shell>
      </SidebarProvider>
    </Providers>
  );
}
