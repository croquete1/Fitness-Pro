// src/components/SidebarWrapper.tsx
import React from "react";
import Sidebar from "./Sidebar";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fp-shell"
      style={{
        minHeight: "calc(100dvh - 64px)",
        alignItems: "start",
      }}
    >
      <Sidebar />
      <div style={{ padding: "1rem" }}>{children}</div>
    </div>
  );
}
