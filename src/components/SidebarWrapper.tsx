// src/components/SidebarWrapper.tsx
import React from "react";
import SidebarClient from "./SidebarClient";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "calc(100dvh - 64px)", // margem aproximada do header
        alignItems: "start",
      }}
    >
      <SidebarClient />
      <div style={{ padding: "1rem" }}>{children}</div>
    </div>
  );
}
