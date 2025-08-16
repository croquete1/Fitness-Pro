"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "./SidebarProvider";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";

function FrameInner({ children }: { children: React.ReactNode }) {
  const { sidebarWidth, isMobile } = useSidebar();

  return (
    <div
      className="fp-shell"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: isMobile ? "0px 1fr" : `${sidebarWidth}px 1fr`,
      }}
    >
      {/* Coluna 1: Sidebar */}
      <Sidebar />

      {/* Coluna 2: Header + Conteúdo */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppHeader />
        <div style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <FrameInner>{children}</FrameInner>
    </SidebarProvider>
  );
}
