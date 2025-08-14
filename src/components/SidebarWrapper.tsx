// src/components/SidebarWrapper.tsx
import React from "react";
import Sidebar from "./Sidebar";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "calc(100dvh - 64px)",
        alignItems: "start",
      }}
    >
      {/* Sidebar com role vinda do SSR */}
      <Sidebar />
      <div style={{ padding: "1rem" }}>{children}</div>
    </div>
  );
}
