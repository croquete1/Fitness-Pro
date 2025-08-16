import React from "react";
import { SidebarProvider } from "@/components/layout/SidebarProvider";
import Sidebar from "@/components/layout/Sidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <AppHeader />
          <main style={{ padding: 12, minWidth: 0 }}>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
