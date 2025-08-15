// src/components/layout/AppHeader.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

  // Menu do avatar
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha menu ao clicar fora / ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Atributos no <html> para a sidebar
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

        {/* Coluna 2: Greeting à esquerda + ações agrupadas à direita */}
        <div className="fp-header-inner">
          <div className="fp-greeting">
            <div className="fp-greeting-title">
              {salutation}, {displayName} 👋
            </div>
            <div className="fp-chip">• bem-vindo(a) de volta</div>
          </div>

          <div className="fp-actions">
            {/* Grupo compacto de ações (pills) */}
            <div className="fp-pill-group" role="group" aria-label="Ações rápidas">
              <ThemeToggle />

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Terminar sessão"
                className="fp-pill"
                type="button"
              >
                <span className="icon" aria-hidden>⎋</span>
                <span className="label">Terminar sessão</span>
              </button>
            </div>

            {/* Avatar + menu */}
            <div className="fp-menu" ref={menuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="fp-avatar"
                onClick={() => setMenuOpen((v) => !v)}
                title={data?.user?.email || "Conta"}
                style={{ cursor: "pointer" }}
              >
                {displayName?.slice(0, 1).toUpperCase()}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Menu do utilizador"
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 8,
                    minWidth: 220,
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    background: "var(--bg)",
                    boxShadow: "0 12px 32px rgba(0,0,0,.14)",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border)",
                      display: "grid",
                      gridTemplateColumns: "36px 1fr",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "1px solid var(--border)",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                      }}
                    >
                      {displayName?.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {data?.user?.name ?? displayName}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: ".82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {data?.user?.email}
                      </div>
                    </div>
                  </div>

                  <MenuItem href="/dashboard/profile" label="Perfil" icon="👤" onClick={() => setMenuOpen(false)} />
                  <MenuItem href="/dashboard/settings" label="Definições" icon="⚙️" onClick={() => setMenuOpen(false)} />
                  <div style={{ borderTop: "1px solid var(--border)" }} />
                  <button
                    role="menuitem"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    style={menuButtonStyle}
                  >
                    <span aria-hidden>⎋</span> Terminar sessão
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  onClick?: () => void;
}) {
  return (
    <a
      role="menuitem"
      href={href}
      onClick={onClick}
      style={menuButtonStyle as React.CSSProperties}
    >
      <span aria-hidden>{icon}</span> {label}
    </a>
  );
}

const menuButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "10px 12px",
  border: "0",
  background: "transparent",
  textDecoration: "none",
  color: "inherit",
  cursor: "pointer",
};
