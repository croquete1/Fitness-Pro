"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { signOut } from "next-auth/react";
import { useSidebar } from "./SidebarProvider";
import { navFor } from "@/lib/nav";

/** Tipos de entrada tolerantes: item simples ou grupo com children */
type NavItem = { key: string; label: string; href: string; icon?: string; badge?: number | string };
type NavGroup = { key: string; label: string; icon?: string; children: NavItem[] };
type Entry = NavItem | NavGroup;

function isGroup(x: Entry): x is NavGroup {
  return (x as any)?.children && Array.isArray((x as any).children);
}

/** Icones simples (emoji) – sem dependências, estáveis */
const ICON: Record<string, string> = {
  dashboard: "📊",
  sessions: "⏱️",
  messages: "✉️",
  profile: "👤",
  billing: "💳",
  reports: "📈",
  settings: "⚙️",
  trainer: "🏋️",
  approvals: "✅",
  workouts: "🏷️",
  clients: "🧑‍🤝‍🧑",
  library: "📚",
  plans: "📘",
  exercises: "🏋️‍♂️",
  users: "👥",
  roster: "🗂️",
  admin: "🛠️",
  system: "🖥️",
  logs: "🧾",
  metrics: "📊",
};

/** Item de navegação */
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`fp-nav-item${active ? " active" : ""}`}
      title={item.label}
      data-tooltip={item.label}
    >
      <span aria-hidden className="fp-ink" />
      <span aria-hidden className="fp-nav-icon">{ICON[item.icon ?? ""] ?? "•"}</span>
      <span className="fp-nav-label">{item.label}</span>
      {item.badge != null && (
        <span className="fp-badge" style={{ marginLeft: "auto" }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const { data } = useSession();
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobile, isMobile } = useSidebar();

  const role = (data?.user as any)?.role ?? "CLIENT";
  const entries = useMemo<Entry[]>(() => navFor(role) as any, [role]);

  // flattener para encontrar o ativo
  const allItems: NavItem[] = useMemo(() => {
    const out: NavItem[] = [];
    for (const e of entries) {
      if (isGroup(e)) out.push(...e.children);
      else out.push(e);
    }
    return out;
  }, [entries]);

  const activeKey = useMemo(() => {
    let best: NavItem | null = null;
    let bestLen = -1;
    for (const it of allItems) {
      const href = it.href;
      if (!href) continue;
      if (pathname === href || pathname.startsWith(href + "/")) {
        if (href.length > bestLen) {
          best = it;
          bestLen = href.length;
        }
      }
    }
    return best?.key ?? null;
  }, [allItems, pathname]);

  return (
    <>
      {/* overlay mobile */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            zIndex: 39,
          }}
        />
      )}
      <aside
        className="fp-sidebar"
        data-collapsed={collapsed ? "true" : "false"}
        style={{
          translate: isMobile ? (mobileOpen ? "0 0" : "-100% 0") : "0 0",
          position: isMobile ? ("fixed" as const) : ("sticky" as const),
          top: 0,
          left: 0,
          zIndex: isMobile ? 40 : 1,
          transition: "translate .18s ease",
        }}
      >
        <nav aria-label="Navegação lateral" className="fp-nav">
          {entries.map((e) =>
            isGroup(e) ? (
              <div key={e.key} className="fp-nav-group">
                <div className="fp-nav-group-title">
                  {ICON[e.icon ?? ""] ? ICON[e.icon ?? ""] + " " : null}
                  {e.label}
                </div>
                {e.children.map((item) => (
                  <NavLink key={item.key} item={item} active={activeKey === item.key} />
                ))}
              </div>
            ) : (
              <NavLink key={e.key} item={e} active={activeKey === e.key} />
            )
          )}
        </nav>

        {/* Footer fixo */}
        <div className="fp-nav-footer">
          <span className="fp-nav-session">Sessão iniciada</span>
          <button
            type="button"
            className="fp-signout"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Terminar sessão"
            data-tooltip="Terminar sessão"
          >
            <span className="fp-nav-icon" aria-hidden>
              ⎋
            </span>
            <span className="fp-label">Terminar sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
}
