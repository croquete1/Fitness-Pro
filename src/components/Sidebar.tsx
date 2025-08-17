"use client";

import React from "react";
import { useSidebar } from "./sidebar/SidebarCtx";
import Logo from "@/components/layout/Logo";

/**
 * Este componente só trata do cabeçalho e dos botões (Afixar / Recolher).
 * A lista de itens/grupos continua a ser renderizada pelo teu Menu.tsx,
 * preservando 100% os ícones e a estrutura original.
 */
const Menu = React.lazy(() => import("@/components/sidebar/Menu"));

export default function Sidebar() {
  const { pinned, collapsed, togglePinned, toggleCollapsed } = useSidebar();

  return (
    <nav>
      {/* Cabeçalho da sidebar: sem botão "Menu"; só Afixar/Desafixar e Recolher/Expandir */}
      <div className="sb-head">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          {!collapsed && <strong>Menu</strong>}
        </div>
        <div className="sb-tools">
          {/* Recolher/Expandir (mostra só ícones quando recolhida) */}
          <button
            type="button"
            className="iconbtn"
            onClick={toggleCollapsed}
            title={collapsed ? "Expandir" : "Recolher (só ícones)"}
            aria-label={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? "⤢" : "⤡"}
          </button>

          {/* Afixar / Desafixar */}
          <button
            type="button"
            className="iconbtn"
            onClick={togglePinned}
            title={pinned ? "Desafixar" : "Afixar"}
            aria-label={pinned ? "Desafixar" : "Afixar"}
          >
            {pinned ? "📌" : "📍"}
          </button>
        </div>
      </div>

      {/* Lista de navegação original (com os teus ícones) */}
      <React.Suspense fallback={null}>
        <Menu />
      </React.Suspense>
    </nav>
  );
}
