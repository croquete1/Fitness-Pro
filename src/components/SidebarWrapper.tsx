"use client";

import React, { useCallback, useState } from "react";
import Sidebar from "./Sidebar";
import MobileSidebarController from "./MobileSidebarController";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);
  const toggleSidebar = useCallback(() => setOpen(v => !v), []);

  return (
    <div className="app-shell" style={{ display: "grid", gridTemplateColumns: "auto 1fr", minHeight: "100dvh" }}>
      <Sidebar open={open} onClose={closeSidebar} onToggle={toggleSidebar} />
      <MobileSidebarController onClose={closeSidebar} />
      <main style={{ width: "100%", overflow: "auto" }}>{children}</main>
    </div>
  );
}
