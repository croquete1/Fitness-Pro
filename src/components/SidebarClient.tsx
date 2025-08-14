// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor, type UserRole } from "@/lib/nav";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export default function SidebarClient({ initialRole }: { initialRole?: UserRole }) {
  const { data } = useSession();
  const pathname = usePathname();

  // role da sessão (cliente) sobrescreve o initialRole quando estiver disponível
  const sessionRole = (data?.user as any)?.role as UserRole | undefined;
  const role = sessionRole ?? initialRole ?? "ALL";

  const items = useMemo(() => navFor(role), [role]);

  return (
    <aside
      style={{
        width: "100%",
        borderRight: "1px solid var(--border)",
        padding: "0.75rem",
        position: "sticky",
        top: 0,
        height: "calc(100dvh - 64px)",
        overflowY: "auto",
        background: "var(--bg)",
      }}
    >
      <nav aria-label="Navegação lateral" style={{ display: "grid", gap: 6 }}>
        {items.map((item) => {
          const active =
            pathname === item.href || (pathname?.startsWith(item.href + "/") && item.href !== "/dashboard");
          return (
            <Link
              key={item.key}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                background: active ? "var(--chip)" : "transparent",
                color: "inherit",
                border: active ? "1px solid var(--border)" : "1px solid transparent",
                fontWeight: active ? 600 : 500,
              }}
            >
              <span aria-hidden style={{ fontSize: 14 }}>{iconFor(item.icon)}</span>
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
