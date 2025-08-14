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

      {/* Rodapé */}
      {data?.user ? (
        <div className="fp-nav-footer">
          <span className="fp-nav-session">Sessão iniciada</span>
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
