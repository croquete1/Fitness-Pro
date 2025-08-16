// src/components/layout/AppHeader.tsx
"use client";

import React from "react";
import { useSidebar } from "./SidebarProvider";
import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { useSession } from "next-auth/react";

function greet(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

export default function AppHeader() {
  const { isMobile, toggleCollapsed, openMobile } = useSidebar();
  const { data: session } = useSession();
  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Utilizador";

  const onHamburger = () => {
    if (isMobile) openMobile();
    else toggleCollapsed();
  };

  return (
    <header
      className="fp-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 10,
        }}
      >
        {/* Botão hambúrguer (sempre visível) */}
        <button
          onClick={onHamburger}
          aria-label="Abrir menu"
          title="Menu"
          style={{
            width: 36,
            height: 36,
            display: "inline-grid",
            placeItems: "center",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "transparent",
            transition: "transform .15s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget.style.transform = "scale(1.03)"))}
          onMouseLeave={(e) => ((e.currentTarget.style.transform = "scale(1.0)"))}
        >
          <Menu size={18} />
        </button>

        {/* Greeting + Logo (logo só em ecrãs médios para cima) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ display: "none", alignItems: "center" }} className="md:flex">
            {/* FIX: Logo usa `size`, não `height` */}
            <Logo size={22} />
          </div>
          <div style={{ lineHeight: 1.1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {greet()} {firstName} 👋
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Sessão iniciada</div>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
