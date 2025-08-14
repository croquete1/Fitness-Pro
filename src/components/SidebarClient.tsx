// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor, type UserRole } from "@/lib/nav";
import { useSession } from "next-auth/react";

export default function SidebarClient() {
  const { data } = useSession();
  const pathname = usePathname();

  // role vem do NextAuth (tipado no teu src/types/next-auth.d.ts)
  const role = (data?.user as any)?.role as UserRole | undefined;
  const items = navFor(role);

  return (
    <aside
      style={{
        width: 250,
        borderRight: "1px solid var(--border)",
        padding: "0.75rem",
        position: "sticky",
        top: 0,
        height: "100dvh",
      }}
    >
      <nav aria-label="Navegação lateral" style={{ display: "grid", gap: 6 }}>
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
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
              }}
            >
              {/* Ícone simples inline (podes trocar pelos teus de components/icons.tsx) */}
              <span aria-hidden style={{ fontSize: 14 }}>
                {iconFor(item.icon)}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
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
