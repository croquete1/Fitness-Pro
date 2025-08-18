import type { ReactNode } from "react";
import SidebarProvider from "@/components/SidebarProvider";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/layout/MainContent";
import AppHeader from "@/components/layout/AppHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen">
        {/* Sidebar (rail + gaveta) */}
        <Sidebar />

        {/* Conteúdo (empurrado dinamicamente) */}
        <MainContent>
          <AppHeader />
          <main className="mx-auto max-w-[1400px] px-6 py-6">{children}</main>
        </MainContent>
      </div>
    </SidebarProvider>
  );
}
