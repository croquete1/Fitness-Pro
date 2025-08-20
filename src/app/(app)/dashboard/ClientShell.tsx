"use client";

import React from "react";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import Sidebar from "@/components/layout/SidebarAdmin";
import AppHeader from "@/components/layout/AppHeader";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="fp-shell">
        <Sidebar />
        <main className="fp-main">
          <AppHeader />
          <div className="fp-content">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
