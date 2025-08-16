"use client";

import React from "react";
import ThemeToggle from "./ThemeToggle";
import { useSidebar } from "./SidebarProvider";
import { NavIcon } from "./icons";
import Logo from "./Logo";

export default function AppHeader() {
  const { isMobile, openMobile, toggleCollapsed } = useSidebar();

  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
      aria-label="Barra de topo"
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
        }}
      >
        {/* Hambúrguer */}
        <button
          onClick={isMobile ? openMobile : toggleCollapsed}
          aria-label="Alternar menu"
          style={{
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <NavIcon name="menu" size={18} />
        </button>

        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div className="hidden md:flex" style={{ alignItems: "center" }}>
            <Logo size={22} />
          </div>
          <div style={{ lineHeight: 1.1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 800,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Fitness Pro
            </div>
            <small style={{ color: "var(--muted)" }}>Dashboard</small>
          </div>
        </div>

        {/* Ações à direita */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
