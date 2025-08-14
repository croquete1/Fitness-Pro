// src/components/layout/AppHeader.tsx
"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import SignOutButton from "@/components/auth/SignOutButton";

function greet(now = new Date()) {
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
      {/* Variáveis e regras globais (inclui lock da sidebar em desktop) */}
      <style jsx global>{`
        :root {
          --bg: #f8fafc;
          --fg: #0f172a;
          --muted: #475569;
          --border: #e2e8f0;
          --accent: #3b82f6;
          --bg-header: rgba(248, 250, 252, 0.85);
          --chip: #e8f0fe;

          /* largura fixa da sidebar no desktop */
          --sidebar-w: 260px;
        }
        [data-theme="dark"] {
          --bg: #0b1220;
          --fg: #e5e7eb;
          --muted: #94a3b8;
          --border: #1f2937;
          --accent: #60a5fa;
          --bg-header: rgba(11, 18, 32, 0.6);
          --chip: #1f2937;
        }
        body {
          background: var(--bg);
          color: var(--fg);
        }
        /* Desktop (PC): sidebar fixa */
        @media (min-width: 1024px) {
          .fp-shell {
            display: grid;
            grid-template-columns: var(--sidebar-w) 1fr !important;
          }
          .fp-sidebar {
            width: var(--sidebar-w) !important;
            min-width: var(--sidebar-w) !important;
            max-width: var(--sidebar-w) !important;
            flex: 0 0 var(--sidebar-w) !important;
          }
        }
        /* Mobile/Tablet: layout fluido */
        @media (max-width: 1023.98px) {
          .fp-shell {
            display: grid;
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: ".75rem",
          padding: ".8rem 1rem",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* Marca / título */}
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <div
            aria-hidden
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid var(--border)",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
            }}
          >
            FP
          </div>
          <div>
            <div style={{ fontWeight: 700, lineHeight: 1 }}>Fitness Pro</div>
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
