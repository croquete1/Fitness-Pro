"use client";

import React from "react";
import { useSidebarState } from "./sidebar/SidebarState";

/** Container geral com header, sidebar e content */
export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const {
    pinned,
    collapsedEffective,
    isMobile,
    open,
    overlay,
    closeSidebar,
    hoverStart,
    hoverEnd,
  } = useSidebarState();

  return (
    <div
      className="fp-shell"
      data-pinned={pinned ? "true" : "false"}
      data-collapsed={collapsedEffective ? "true" : "false"}
      data-overlay={overlay ? "true" : "false"}
      data-open={overlay && open ? "true" : "false"}
    >
      {/* HOTSPOT: quando pinada e colapsada, aproximar o rato expande temporariamente */}
      {pinned && collapsedEffective && (
        <div
          className="fp-hover-hotspot"
          onMouseEnter={hoverStart}
          onMouseLeave={hoverEnd}
          aria-hidden
        />
      )}

      {/* Sidebar + nav vem do teu componente atual */}
      <aside className="fp-sidebar" onMouseLeave={hoverEnd} onMouseEnter={hoverStart}>
        {/* header curto/opcional da sidebar */}
        <nav className="fp-nav">{/* aqui renderizas o menu */}</nav>
      </aside>

      {/* Overlay (só visível quando overlay + open) */}
      <div className="fp-overlay" onClick={closeSidebar} />

      {/* Header e Content continuam exatamente como tens */}
      <main className="fp-content">{children}</main>
    </div>
  );
}
