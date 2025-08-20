// src/components/layout/DashboardFrame.tsx (excerto)
import React from "react";
import SidebarProvider from "./SidebarProvider"; // default OK (também podes usar { SidebarProvider })
import Sidebar from "./SidebarAdmin";
import AppHeader from "./AppHeader";

export default function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <AppHeader />
          <main>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
