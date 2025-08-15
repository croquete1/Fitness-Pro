// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor, type UserRole, type NavIcon } from "@/lib/nav";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { signOut } from "next-auth/react";

/** Mapeamento de ícones por chave (sincronizado com src/lib/nav.ts) */
const ICONS: Record<NavIcon, string> = {
  dashboard: "📊",
  sessions:  "⏱️",
  messages:  "✉️",
  profile:   "👤",
  billing:   "💳",
  reports:   "📈",
  settings:  "⚙️",
  trainer:   "🏋️",
  approvals: "✅",
  workouts:  "💪",
  clients:   "🧑‍🤝‍🧑",
  library:   "📚",
  plans:     "📘",
  exercises: "🏷️",
  users:     "👥",
  roster:    "🗂️",
  admin:     "🛠️",
  system:    "🖥️",
  logs:      "🧾",
  metrics:   "📊", // podes trocar por outro se quiseres diferenciar
};

function iconFor(name: NavIcon): string {
  return ICONS[name] ?? "•";
}

export default function SidebarClient({ initialRole }: { initialRole?: UserRole }) {
  const { data } = useSession();
  const pathname = usePathname();

  const sessionRole = (data?.user as any)?.role as UserRole | undefined;
  const role = sessionRole ?? initialRole ?? "CLIENT"; // fallback inofensivo

  const items = useMemo(() => navFor(role), [role]);

  return (
    <aside className="fp-sidebar">
      {/* Navegação */}
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
              data-tooltip={item.label}   /* tooltip quando colapsada */
            >
              <span aria-hidden className="fp-ink" />
              <span aria-hidden className="fp-nav-icon">{iconFor(item.icon)}</span>
              <span className="fp-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer fixo (sessão / terminar) */}
      <div className="fp-nav-footer">
        <span className="fp-nav-session fp-label">Sessão iniciada</span>
        <button
          type="button"
          className="fp-signout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Terminar sessão"
          data-tooltip="Terminar sessão"
        >
          <span className="icon" aria-hidden>⎋</span>
          <span className="fp-label">Terminar sessão</span>
        </button>
      </div>
    </aside>
  );
}
