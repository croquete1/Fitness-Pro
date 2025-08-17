"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {useSidebar} from "./sidebar/SidebarCtx";

/** IMPORTA os teus dados/estruturas existentes */
import { GROUPS } from "./sidebar/data";   // <- mantém como já tens (ícones, rotas, etc.)

export default function Sidebar(){
  const { pinned, collapsed, togglePinned, toggleCollapsed } = useSidebar();

  return (
    <nav>
      {/* Cabeçalho da sidebar (logo + ações). Sem “Menu”. */}
      <div className="sb-head">
        <div className="flex items-center gap-2">
          <Image src="/logo-64.png" alt="HMS" width={28} height={28} />
          {!collapsed && <strong>Menu</strong>}
        </div>
        <div className="sb-tools">
          {/* Recolher/Expandir (fica fixa e mostra só ícones) */}
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

      {/* Secções e itens. Mantém os teus ícones */}
      {GROUPS.map((g) => (
        <div key={g.key}>
          <div className="sb-section">{g.title}</div>
          {g.items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`sb-item ${it.current ? "current" : ""}`}
              title={it.title}
            >
              <span className="ico">{it.icon /* já vinham do teu projeto */}</span>
              <span className="label">{it.title}</span>
              {it.hasChildren && <span className="label">›</span>}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
