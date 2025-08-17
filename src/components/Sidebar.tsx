// src/components/Sidebar.tsx
"use client";

import React from "react";
import Menu from "./sidebar/Menu";
import { useSidebar } from "./SidebarWrapper";

export default function Sidebar() {
  const { pinned, collapsed } = useSidebar();

  return (
    <nav
      className="sidebar-body"
      data-pinned={pinned ? "" : undefined}
      data-collapsed={collapsed ? "" : undefined}
    >
      {/* Mantém o teu menu e ícones tal como tinhas */}
      <React.Suspense fallback={null}>
        <Menu />
      </React.Suspense>
    </nav>
  );
}
