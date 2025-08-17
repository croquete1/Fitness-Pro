"use client";
import React from "react";
import {SidebarProvider, useSidebar} from "./sidebar/SidebarCtx";
import Sidebar from "./Sidebar";

/** Wrapper usado no layout das páginas com sidebar */
function Inner({children}:{children:React.ReactNode}){
  const {pinned, collapsed, mobileOpen, closeMobile} = useSidebar();

  return (
    <div
      className="fp-shell"
      data-pinned={pinned ? "" : undefined}
      data-collapsed={collapsed ? "" : undefined}
      data-overlay={!pinned ? "" : undefined}
    >
      {/* Sidebar */}
      <aside className="fp-sidebar" data-open={mobileOpen ? "" : undefined}>
        <Sidebar />
      </aside>

      {/* Conteúdo */}
      <main className="fp-content">{children}</main>

      {/* Overlay para mobile */}
      <div
        className="fp-overlay"
        data-open={mobileOpen ? "" : undefined}
        onClick={closeMobile}
        aria-hidden
      />
    </div>
  );
}

export default function SidebarWrapper({children}:{children:React.ReactNode}){
  return (
    <SidebarProvider>
      <Inner>{children}</Inner>
    </SidebarProvider>
  );
}
