// src/components/SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor, type UserRole, type NavIcon } from "@/lib/nav";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

/** Ícones em emoji (zero dependências e dark-mode friendly) */
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

function iconFor(name: NavIcon): string {
  return ICONS[name] ?? "•";
}

/** Estruturas “locais” (compatíveis com o que vem de navFor) */
type Entry = { key: string; label: string; href: string; icon: NavIcon };
type Group = { key: string; label: string; children: Entry[] };
function isGroup(it: Entry | Group): it is Group {
  return (it as any)?.children && Array.isArray((it as any).children);
}
function isEntry(it: Entry | Group): it is Entry {
  return typeof (it as any)?.href === "string";
}

/** Contadores leves (ex.: mensagens não lidas) — opcional/robusto */
function useCounters() {
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let stop = false;
    const fetcher = async () => {
      try {
        const res = await fetch("/api/dashboard/counters", { cache: "no-store" });
        const j = await res.json();
        if (!stop) setUnread(Number(j?.data?.notificationsUnread ?? 0));
      } catch {
        /* silencioso */
      }
    };
    fetcher();

    const iv = setInterval(fetcher, 20_000);
    const vis = () => document.visibilityState === "visible" && fetcher();
    document.addEventListener("visibilitychange", vis);

    return () => {
      stop = true;
      clearInterval(iv);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return { unread };
}

export default function SidebarClient({ initialRole }: { initialRole?: UserRole }) {
  const { data } = useSession();
  const pathname = usePathname();
  const { unread } = useCounters();

  const sessionRole = (data?.user as any)?.role as UserRole | undefined;
  const role = sessionRole ?? initialRole ?? "CLIENT";

  /** navFor pode devolver grupos e/ou entradas; normalizamos o tipo. */
  const items = useMemo<(Entry | Group)[]>(() => navFor(role) as any, [role]);

  /** Lista plana só com entradas para fazer *longest-prefix match* do ativo. */
  const flatItems = useMemo<Entry[]>(() => {
    const out: Entry[] = [];
    for (const it of items) {
      if (isEntry(it)) out.push(it);
      else if (isGroup(it)) for (const c of it.children) out.push(c);
    }
    return out;
  }, [items]);

  const activeKey = useMemo(() => {
    let best: string | null = null;
    let bestLen = -1;
    for (const it of flatItems) {
      const href = it.href;
      if (!href) continue;
      if (pathname === href || pathname.startsWith(href + "/")) {
        if (href.length > bestLen) {
          best = it.key;
          bestLen = href.length;
        }
      }
    }
    return best;
  }, [flatItems, pathname]);

  /** Componente de item (entrada) reutilizável */
  const EntryLink = ({ entry }: { entry: Entry }) => {
    const active = activeKey === entry.key;
    const showBadge = entry.key === "messages" && unread > 0;

    return (
      <Link
        key={entry.key}
        href={entry.href}
        prefetch={false}
        aria-current={active ? "page" : undefined}
        className={`fp-nav-item${active ? " active" : ""}`}
        title={entry.label}
        data-tooltip={entry.label}
        style={{
          transition: "background .15s ease, transform .15s ease, border-color .15s ease",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)")}
      >
        <span aria-hidden className="fp-ink" />
        <span aria-hidden className="fp-nav-icon">{iconFor(entry.icon)}</span>

        <span className="fp-nav-label" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {entry.label}
          {showBadge && (
            <span
              className="fp-badge"
              aria-label={`${unread} por ler`}
              title={`${unread} por ler`}
              style={{
                marginLeft: 6,
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 700,
                border: "1px solid var(--border)",
                background: "var(--badge-bg, rgba(239,68,68,.12))",
                color: "var(--badge-fg, #ef4444)",
                lineHeight: 1.2,
              }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </Link>
    );
  };

  return (
    <aside className="fp-sidebar">
      <nav aria-label="Navegação lateral" className="fp-nav">
        {items.map((it) => {
          if (isEntry(it)) {
            return <EntryLink key={it.key} entry={it} />;
          }
          if (isGroup(it)) {
            return (
              <div key={it.key} className="fp-nav-group" style={{ display: "grid", gap: 6 }}>
                <div
                  className="fp-nav-group-title"
                  aria-hidden
                  title={it.label}
                  style={{
                    fontSize: 12,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    padding: "6px 10px",
                    fontWeight: 800,
                  }}
                >
                  {it.label}
                </div>
                {it.children.map((c) => (
                  <EntryLink key={c.key} entry={c} />
                ))}
              </div>
            );
          }
          return null;
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
          style={{ transition: "transform .15s ease" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)")}
        >
          <span className="icon" aria-hidden>⎋</span>
          <span className="fp-label">Terminar sessão</span>
        </button>
      </div>
    </aside>
  );
}
