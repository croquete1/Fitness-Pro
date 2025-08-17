"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { navFor, type UserRole, type NavIcon } from "@/lib/nav";
import { useEffect, useMemo, useState } from "react";

/** Ícones simples (emojis) – estável, sem dependências de lib */
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

/** Tipos locais – compatíveis com o que navFor devolve */
type Entry = { key: string; label: string; href: string; icon: NavIcon };
type Group = { key: string; label: string; children: Entry[] };
function isGroup(x: Entry | Group): x is Group {
  return Array.isArray((x as any)?.children);
}
function isEntry(x: Entry | Group): x is Entry {
  return typeof (x as any)?.href === "string";
}

/** Contadores leves (ex.: não lidas) – opcional/robusto */
function useCounters() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let stop = false;
    const fetcher = async () => {
      try {
        const r = await fetch("/api/dashboard/counters", { cache: "no-store" });
        const j = await r.json();
        if (!stop) setUnread(Number(j?.data?.notificationsUnread ?? 0));
      } catch { /* noop */ }
    };
    fetcher();
    const iv = setInterval(fetcher, 20_000);
    const vis = () => document.visibilityState === "visible" && fetcher();
    document.addEventListener("visibilitychange", vis);
    return () => { stop = true; clearInterval(iv); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return { unread };
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  const { unread } = useCounters();

  const role: UserRole = ((data?.user as any)?.role as UserRole) ?? "CLIENT";
  const items = useMemo<(Entry | Group)[]>(() => navFor(role) as any, [role]);

  // flatten para calcular item ativo por longest-prefix
  const flat: Entry[] = useMemo(() => {
    const out: Entry[] = [];
    for (const it of items) {
      if (isEntry(it)) out.push(it);
      else if (isGroup(it)) out.push(...it.children);
    }
    return out;
  }, [items]);

  const activeKey = useMemo(() => {
    let best: string | null = null;
    let bestLen = -1;
    for (const it of flat) {
      if (!it.href) continue;
      if (pathname === it.href || pathname.startsWith(it.href + "/")) {
        if (it.href.length > bestLen) { best = it.key; bestLen = it.href.length; }
      }
    }
    return best;
  }, [flat, pathname]);

  const EntryLink = ({ entry }: { entry: Entry }) => {
    const active = activeKey === entry.key;
    const showBadge = entry.key === "messages" && unread > 0;
    return (
      <Link
        href={entry.href}
        prefetch={false}
        aria-current={active ? "page" : undefined}
        className={`fp-nav-item${active ? " active" : ""}`}
        title={entry.label}
        data-tooltip={entry.label}
        style={{ transition: "background .15s ease, transform .15s ease, border-color .15s ease" }}
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
                marginLeft: 6, borderRadius: 999, padding: "2px 8px",
                fontSize: 11, fontWeight: 700, lineHeight: 1.2,
                border: "1px solid var(--border)",
                background: "var(--badge-bg, rgba(239,68,68,.12))",
                color: "var(--badge-fg, #ef4444)",
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
          if (isEntry(it)) return <EntryLink key={it.key} entry={it} />;
          if (isGroup(it)) {
            return (
              <div key={it.key} className="fp-nav-group" style={{ display: "grid", gap: 6 }}>
                <div
                  className="fp-nav-group-title"
                  aria-hidden
                  title={it.label}
                  style={{
                    fontSize: 12, letterSpacing: 0.3, textTransform: "uppercase",
                    color: "var(--muted)", padding: "6px 10px", fontWeight: 800,
                  }}
                >
                  {it.label}
                </div>
                {it.children.map((c) => <EntryLink key={c.key} entry={c} />)}
              </div>
            );
          }
          return null;
        })}
      </nav>

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
