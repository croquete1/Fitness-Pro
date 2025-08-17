"use client";

import React from "react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { useSidebar } from "./SidebarProvider";

function greet(now: Date) {
  const h = now.getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

export default function AppHeader() {
  const { toggle, isMobile, setMobileOpen } = useSidebar();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "var(--app-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "saturate(160%) blur(6px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
        }}
      >
        {/* Hambúrguer */}
        <button
          type="button"
          aria-label="Abrir/fechar navegação"
          className="pill"
          onClick={() => {
            if (isMobile) setMobileOpen(true);
            else toggle();
          }}
          title="Menu"
        >
          <span aria-hidden>☰</span>
        </button>

        {/* Logo + título reduzido */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Logo size={20} />
          <div style={{ lineHeight: 1.1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Fitness Pro
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Dashboard
            </div>
          </div>
        </div>

        {/* Ações à direita */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <ThemeToggle />
        </div>
      </div>

      {/* saudação centrada (opcional) */}
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
        <div className="pill" aria-live="polite">
          {greet(new Date())}, Admin 👋
        </div>
      </div>
    </header>
  );
}
