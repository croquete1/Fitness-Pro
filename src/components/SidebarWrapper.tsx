// src/components/SidebarWrapper.tsx
import React from "react";
import SidebarClient from "./SidebarClient";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", minHeight: "100dvh" }}>
      <SidebarClient />
      <div style={{ padding: "1rem" }}>{children}</div>
    </div>
  );
}
