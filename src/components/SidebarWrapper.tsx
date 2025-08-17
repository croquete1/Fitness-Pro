"use client";

import React from "react";
import { SidebarProvider } from "@/components/layout/SidebarProvider";
import Sidebar from "@/components/layout/Sidebar";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "var(--sidebar-w, 260px) 1fr",
          minHeight: "100dvh",
          background: "var(--app-bg)",
        }}
      >
        <Sidebar />
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </SidebarProvider>
  );
}
