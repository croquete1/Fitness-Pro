// src/components/layout/AppHeader.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
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

  // Estado para mobile (off-canvas)
  const [open, setOpen] = useState(false);
  // Estado para desktop (colapsar largura)
  const [collapsed, setCollapsed] = useState(false);

  // Sincroniza attrs no <html>
  useEffect(() => {
    const html = document.documentElement;
    if (open) html.setAttribute("data-sidebar", "open");
    else html.removeAttribute("data-sidebar");
  }, [open]);

  useEffect(() => {
    const html = document.documentElement;
    if (collapsed) html.setAttribute("data-sidebar-collapsed", "1");
    else html.removeAttribute("data-sidebar-collapsed");
  }, [collapsed]);

  // Ajustes ao mudar viewport
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) {
        // Em mobile não faz sentido “colapsado”
        setCollapsed(false);
      } else {
        // Em desktop não usamos overlay de mobile
        setOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const displayName =
    (data?.user?.name && data.user.name.split(" ")[0]) ||
    data?.user?.email?.split("@")[0] ||
    "Utilizador";

  const salutation = useMemo(() => greet(new Date()), []);

  // Um botão que funciona para ambos os modos
  const handleHamburger = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setCollapsed((v) => !v);
    } else {
      setOpen((v) => !v);
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 90 as any, // 90 (texto não aceita números com underscore)
        borderBottom: "1px solid var(--border)",
        backdropFilter: "saturate(180%) blur(8px)",
        background: "var(--bg-header)",
      } as React.CSSProperties}
    >
      <div className="fp-header">
        {/* Coluna 1: marca (acima da sidebar) */}
        <div className="fp-brand">
          <button
            className="fp-hamburger"
            type="button"
            aria-label={
              typeof window !== "undefined" && window.innerWidth >= 1024
                ? collapsed ? "Expandir sidebar" : "Encolher sidebar"
                : open ? "Fechar menu" : "Abrir menu"
            }
            aria-expanded={typeof window !== "undefined" && window.innerWidth >= 1024 ? collapsed : open}
            onClick={handleHamburger}
          >
            {/* Ícone hambúrguer/menus */}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>

          <Logo size={30} priority />

          <div>
            <div style={{ fontWeight: 700, lineHeight: 1 }}>{brand.name}</div>
            <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>Dashboard</div>
          </div>
        </div>

        {/* Coluna 2: saudação (à esquerda) + ações (à direita) */}
        <div className="fp-header-inner">
          {/* Saudação alinhada à esquerda do conteúdo */}
          <div className="fp-greeting">
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
          <div className="fp-actions">
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
      </div>
    </header>
  );
}
