import React from "react";
import Sidebar from "./Sidebar";
import MobileSidebarController from "./MobileSidebarController";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="fp-shell">
      {/* Sidebar (server) + Overlay controlador (client) */}
      <Sidebar />
      <div style={{ padding: "1rem" }}>{children}</div>
      <MobileSidebarController />
    </div>
  );
}
