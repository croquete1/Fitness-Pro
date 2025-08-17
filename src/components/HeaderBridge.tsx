"use client";

import React from "react";
import { useSidebarState } from "./sidebar/SidebarState";

export default function HeaderBridge() {
  const {
    overlay, open, toggleSidebar,
    pinned, togglePin,
    collapsed, toggleCollapse,
  } = useSidebarState() as any;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {/* Botão hamburguer: só relevante quando overlay (mobile/desktop solta) */}
      {overlay && (
        <button className="btn" onClick={toggleSidebar} aria-expanded={open}>
          {open ? "Fechar" : "Menu"}
        </button>
      )}

      {/* Fixar / Soltar */}
      <button className="btn" onClick={togglePin} title={pinned ? "Soltar" : "Fixar"}>
        {pinned ? "📌 Solta" : "📍 Fixar"}
      </button>

      {/* Recolher / Expandir (só tem efeito quando pinada) */}
      <button className="btn" onClick={toggleCollapse} title="Recolher/Expandir">
        {collapsed ? "⟷ Expandir" : "⇤ Recolher"}
      </button>
    </div>
  );
}
