"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useSidebarState } from "../SidebarWrapper";

export default function AppHeader() {
  const { setCollapsed, collapsed, setOverlayOpen } = useSidebarState();

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <div className="fp-header-left">
          <button className="fp-btn" onClick={() => setOverlayOpen(true)} aria-label="Abrir menu" title="Menu">☰</button>
          <button
            className="fp-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        <input className="fp-search" placeholder="Pesquisar cliente por nome ou email…" aria-label="Pesquisar" />

        <div className="fp-header-right">
          <button className="fp-btn fp-btn-ghost" aria-label="Notificações" title="Notificações">🔔</button>
          <button className="fp-btn fp-btn-ghost" aria-label="Alternar tema">🌓</button>
          <button className="fp-btn fp-btn-primary" onClick={() => signOut({ callbackUrl: "/login" })}>
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
