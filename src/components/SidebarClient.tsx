// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor, type UserRole } from "@/lib/nav";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import SignOutButton from "@/components/auth/SignOutButton";

export default function SidebarClient({ initialRole }: { initialRole?: UserRole }) {
  const { data } = useSession();
  const pathname = usePathname();

  const sessionRole = (data?.user as any)?.role as UserRole | undefined;
  const role = sessionRole ?? initialRole ?? "ALL";

  const items = useMemo(() => navFor(role), [role]);

  return (
    <aside
      className="fp-sidebar"
      style={{
        width: "100%",
        borderRight: "1px solid var(--border)",
        padding: "0.75rem",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Links */}
      <nav
        aria-label="Navegação lateral"
        style={{
          display: "grid",
          gap: 8,
          alignContent: "start",                 // NÃO esticar linhas
          justifyContent: "start",
          gridAutoRows: "max-content",           // cada linha só ocupa o conteúdo
          // Não usar height fixa; deixar o flex empurrar o rodapé
          flex: 1,
          minHeight: 0,
        }}
      >
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (pathname?.startsWith(item.href + "/") && item.href !== "/dashboard");
          return (
            <Link
              key={item.key}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 10,
                textDecoration: "none",
                background: active ? "var(--chip)" : "transparent",
                color: "inherit",
                border: active ? "1px solid var(--border)" : "1px solid transparent",
                fontWeight: active ? 600 : 500,
                lineHeight: 1.2,
                minHeight: 0,              // evita esticar
                whiteSpace: "nowrap",      // evita quebra de linha
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span aria-hidden style={{ fontSize: 14 }}>{iconFor(item.icon)}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      {data?.user ? (
        <div
          style={{
            marginTop: "auto",
            paddingTop: ".75rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: ".5rem",
          }}
        >
          <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>Sessão iniciada</span>
          <SignOutButton variant="link" />
        </div>
      ) : null}
    </aside>
  );
}

function iconFor(name: string) {
  switch (name) {
    case "dashboard": return "📊";
    case "sessions":  return "⏱️";
    case "messages":  return "✉️";
    case "plans":     return "📘";
    case "library":   return "📚";
    case "admin":     return "🛠️";
    default:          return "•";
  }
}
