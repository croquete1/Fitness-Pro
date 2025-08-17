// src/app/(app)/layout.tsx
import React from "react";
import type { Metadata } from "next";

import Providers from "@/app/providers";                 // wrapper de tema/contexts (client provider)
import { SidebarProvider } from "@/components/SidebarWrapper"; // provider do estado da sidebar
import Sidebar from "@/components/Sidebar";              // componente da sidebar (client)
import AppHeader from "@/components/layout/AppHeader";   // header (client)

export const metadata: Metadata = {
  title: "Dashboard | Fitness Pro",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <SidebarProvider>
        <div className="fp-shell">
          {/* Coluna fixa da sidebar */}
          <Sidebar />

          {/* Área principal */}
          <main className="fp-main">
            <AppHeader />
            <div className="fp-content">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
