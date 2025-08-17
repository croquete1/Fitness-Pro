// src/components/layout/AppHeader.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
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

  // Mobile: abre/fecha off-canvas
  const [open, setOpen] = useState(false);
  // Desktop: colapsa/expande a largura
  const [collapsed, setCollapsed] = useState(false);
  // Animação do clique do hambúrguer
  const [pressed, setPressed] = useState(false);

  // Atributos no <html> para o CSS
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

  // Sincroniza ao mudar viewport
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setCollapsed(false);
      else setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const displayName =
    (data?.user?.name && data.user.name.split(" ")[0]) ||
    data?.user?.email?.split("@")[0] ||
    "Utilizador";

  const salutation = useMemo(() => greet(new Date()), []);

  const handleHamburger = () => {
    // animação “bump”
    setPressed(true);
    setTimeout(() => setPressed(false), 180);

    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setCollapsed((v) => !v); // desktop
    } else {
      setOpen((v) => !v); // mobile
    }
  };

  const expanded =
    typeof window !== "undefined" && window.innerWidth >= 1024 ? collapsed : open;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 90,
        borderBottom: "1px solid var(--border)",
        backdropFilter: "saturate(180%) blur(8px)",
        background: "var(--bg-header)",
      }}
    >
      <div className="fp-header">
        {/* Coluna 1: Marca por cima da coluna da sidebar */}
        <div className="fp-brand">
          <button
            className={`fp-hamburger ${pressed ? "is-pressed" : ""}`}
            type="button"
            aria-label="Alternar menu"
            aria-expanded={expanded}
            onClick={handleHamburger}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>

          <Logo size={30} priority />

          <div className="fp-brand-text">
            <div className="fp-brand-name">{brand.name}</div>
            <div className="fp-brand-sub">Dashboard</div>
          </div>
        </div>

        {/* Coluna 2: Greeting à esquerda + ações à direita */}
        <div className="fp-header-inner">
          <div className="fp-greeting">
            <div className="fp-greeting-title">
              {salutation}, {displayName} 👋
            </div>
            <div className="fp-chip">• bem-vindo(a) de volta</div>
          </div>

          <div className="fp-actions">
            <ThemeToggle />
            {data?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Terminar sessão"
                className="fp-btn-ghost"
              >
                Terminar sessão
              </button>
            ) : null}
            <div className="fp-avatar" title={data?.user?.email || "Utilizador"}>
              {displayName?.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}