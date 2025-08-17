"use client";

import React from "react";
import SidebarProvider from "@/components/SidebarWrapper";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="fp-shell">
        <Sidebar />
        <main className="fp-main">
          {/* Header original (com pesquisa, terminar sessão, etc.) */}
          <AppHeader />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
