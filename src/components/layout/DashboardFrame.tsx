"use client";

import React from "react";
import { SidebarProvider } from "./SidebarProvider";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";

export default function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          minHeight: "100vh",
          background: "var(--app-bg, var(--bg))",
        }}
      >
        <Sidebar />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <AppHeader />
          <main style={{ padding: 12, minWidth: 0 }}>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
