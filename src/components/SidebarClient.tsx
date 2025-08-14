// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor, type UserRole } from "@/lib/nav";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { signOut } from "next-auth/react";

export default function SidebarClient({ initialRole }: { initialRole?: UserRole }) {
  const { data } = useSession();
  const pathname = usePathname();

  const sessionRole = (data?.user as any)?.role as UserRole | undefined;
  const role = sessionRole ?? initialRole ?? "ALL";

  const items = useMemo(() => navFor(role), [role]);

  return (
    <aside className="fp-sidebar">
      {/* Links */}
      <nav aria-label="Navegação lateral" className="fp-nav">
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
              className={`fp-nav-item${active ? " active" : ""}`}
              title={item.label}
            >
              <span aria-hidden className="fp-ink" />
              <span aria-hidden className="fp-nav-icon">{iconFor(item.icon)}</span>
              <span className="fp-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé — mantém visível; em colapso mostra ícone-only */}
      <div className="fp-nav-footer">
        <span className="fp-nav-session fp-label">Sessão iniciada</span>
        <button
          type="button"
          className="fp-signout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Terminar sessão"
        >
          <span className="icon" aria-hidden>⎋</span>
          <span className="fp-label">Terminar sessão</span>
        </button>
      </div>
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
