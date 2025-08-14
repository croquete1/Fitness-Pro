// src/components/layout/AppHeader.tsx
"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";
import Logo from "@/components/layout/Logo";
import { brand } from "@/lib/brand";

function greet(now: Date) {
  const h = now.getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 20) return "Boa tarde";
  return "Boa noite";
}

export default function AppHeader() {
  const { data } = useSession();

  const displayName =
    (data?.user?.name && data.user.name.split(" ")[0]) ||
    data?.user?.email?.split("@")[0] ||
    "Utilizador";

  const salutation = useMemo(() => greet(new Date()), []);

  const toggleSidebar = () => {
    const html = document.documentElement;
    const isOpen = html.getAttribute("data-sidebar") === "open";
    if (isOpen) html.removeAttribute("data-sidebar");
    else html.setAttribute("data-sidebar", "open");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        borderBottom: "1px solid var(--border)",
        backdropFilter: "saturate(180%) blur(8px)",
        background: "var(--bg-header)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: ".75rem",
          padding: ".8rem 1rem",
          maxWidth: 1280,
          margin: "0 auto",
          minHeight: "var(--header-h)",
        }}
      >
        {/* Marca / título + Hambúrguer em mobile */}
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <button
            className="fp-hamburger"
            type="button"
            aria-label="Abrir menu"
            onClick={toggleSidebar}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>

          <Logo size={30} />

          <div>
            <div style={{ fontWeight: 700, lineHeight: 1 }}>{brand.name}</div>
            <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>Dashboard</div>
          </div>
        </div>

        {/* Saudação */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 600 }}>
            {salutation}, {displayName} 👋
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: ".8rem",
              color: "var(--muted)",
              display: "inline-flex",
              gap: ".5rem",
              alignItems: "center",
              padding: ".2rem .6rem",
              border: "1px solid var(--border)",
              borderRadius: "999px",
              background: "var(--chip)",
            }}
          >
            <span aria-hidden>•</span>
            <span style={{ letterSpacing: ".2px" }}>bem-vindo(a) de volta</span>
          </div>
        </div>

        {/* Ações (direita) */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: ".6rem", alignItems: "center" }}>
          <ThemeToggle />
          {data?.user ? <SignOutButton /> : null}
          <div
            title={data?.user?.email || "Utilizador"}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              userSelect: "none",
            }}
          >
            {displayName?.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
