// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor, type UserRole, type NavIcon, type NavEntry, type NavItem } from "@/lib/nav";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { signOut } from "next-auth/react";

/** Ícones sincronizados com lib/nav.ts */
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
  metrics:   "📊",
};
const iconFor = (name: NavIcon) => ICONS[name] ?? "•";

const normalize = (p?: string | null) => {
  if (!p) return "/";
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
};

export default function SidebarClient({ initialRole }: { initialRole?: UserRole }) {
  const { data } = useSession();
  const pathname = normalize(usePathname());

  const sessionRole = (data?.user as any)?.role as UserRole | undefined;
  const role = sessionRole ?? initialRole ?? "CLIENT";

  const entries: NavEntry[] = useMemo(() => navFor(role), [role]);

  return (
    <aside className="fp-sidebar">
      <nav aria-label="Navegação lateral" className="fp-nav">
        {entries.map((entry) =>
          entry.kind === "group" ? (
            <div key={entry.key} className="fp-nav-group" aria-label={entry.label}>
              <span className="bar" aria-hidden />
              <span className="title">{entry.label}</span>
            </div>
          ) : (
            <SidebarLink key={entry.key} item={entry} pathname={pathname} />
          )
        )}
      </nav>

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

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string | undefined }) {
  const isActive = normalize(item.href) === pathname; // seleção EXATA (categorias nunca ficam ativas)

  return (
    <Link
      href={item.href}
      prefetch={false}
      aria-current={isActive ? "page" : undefined}
      className={`fp-nav-item${isActive ? " active" : ""}`}
      title={item.label}
      data-tooltip={item.label}
    >
      <span aria-hidden className="fp-ink" />
      <span aria-hidden className="fp-nav-icon">{iconFor(item.icon)}</span>
      <span className="fp-nav-label">{item.label}</span>
    </Link>
  );
}
