/* Server Component */
import React from "react";
import Providers from "@/app/providers";                // providers globais (tema, etc.)
import SidebarProvider from "@/components/SidebarWrapper"; // <— DEFAULT import, não named
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <SidebarProvider>
        <div className="fp-shell">
          <Sidebar />
          <main className="fp-main">
            <AppHeader />
            {children}
          </main>
        </div>
      </SidebarProvider>
    </Providers>
  );
}
