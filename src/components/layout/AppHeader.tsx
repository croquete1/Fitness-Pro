"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useSidebar } from "./SidebarContext";

export default function AppHeader() {
  const { isMobile, pinned, toggleSidebar, toggleCollapse, collapsed, togglePin } = useSidebar();

  return (
    <header className="fp-header" role="banner">
      <div className="fp-header-inner">
        <div className="fp-header-left">
          {/* Botão Menu: aparece quando overlay (mobile ou unpinned) */}
          {(!pinned || isMobile) && (
            <button className="btn ghost" onClick={toggleSidebar} aria-label="Menu">
              ☰
            </button>
          )}

          {/* Colapsar/Expandir (válido quando pinada) */}
          <button
            className="btn ghost"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>

          {/* Fixar/Desafixar */}
          <button
            className="btn ghost"
            onClick={togglePin}
            aria-label={pinned ? "Desafixar sidebar" : "Fixar sidebar"}
            title={pinned ? "Desafixar sidebar" : "Fixar sidebar"}
          >
            📌
          </button>

          {/* Campo de pesquisa simples (mantém visual leve) */}
          <input
            className="fp-search"
            placeholder="Pesquisar cliente por nome ou email…"
            aria-label="Pesquisar"
          />
        </div>

        <div className="fp-header-right">
          {/* Alternar tema: muito simples e à prova de bala */}
          <button
            className="btn ghost"
            onClick={() => {
              try {
                const html = document.documentElement;
                const cur = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
                const next = cur === "dark" ? "light" : "dark";
                html.setAttribute("data-theme", next);
                localStorage.setItem("fp-theme", next);
              } catch {}
            }}
            aria-label="Alternar tema"
            title="Alternar tema"
          >
            🌓
          </button>

          <button className="btn" onClick={() => signOut({ callbackUrl: "/login" })}>
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
