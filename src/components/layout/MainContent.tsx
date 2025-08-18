"use client";

import React from "react";
import { useSidebar } from "@/components/SidebarProvider";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { railWidth, panelWidth, pinned, collapsed } = useSidebar();

  // base: rail sempre ocupa espaço
  // se AFIXADA e EXPANDIDA => empurra mais o conteúdo
  const extra = pinned && !collapsed ? panelWidth : 0;
  const paddingLeft = railWidth + extra;

  return (
    <div
      className="min-h-screen"
      style={{
        paddingLeft,
        transition: "padding-left 320ms ease-out",
      }}
    >
      {children}
    </div>
  );
}
