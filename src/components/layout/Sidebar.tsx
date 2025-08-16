"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { NAV_ITEMS } from "@/lib/nav";
import { NavIcon } from "./icons";

const W = 272;
const W_MIN = 76;

function isGroup(it: any): it is { key: string; label: string; children: any[]; showFor?: string[] } {
  return Array.isArray((it as any)?.children);
}
function isEntry(it: any): it is { key: string; label: string; href: string; icon?: string; showFor?: string[] } {
  return typeof (it as any)?.href === "string";
}
function isAllowed(showFor: string[] | undefined, role: string) {
  if (!Array.isArray(showFor) || showFor.length === 0) return true;
  return showFor.includes("ALL") || showFor.includes(role);
}

function useUnreadCounters() {
  const [notificationsUnread, setNoti] = React.useState(0);
  const fetcher = React.useCallback(async () => {
    try {
      const r = await fetch("/api/dashboard/counters", { cache: "no-store" });
      const j = await r.json();
      setNoti(Number(j?.data?.notificationsUnread ?? 0));
    } catch {}
  }, []);
  React.useEffect(() => {
    fetcher();
    const iv = setInterval(fetcher, 20_000);
    const vis = () => document.visibilityState === "visible" && fetcher();
    document.addEventListener("visibilitychange", vis);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [fetcher]);
  return { notificationsUnread };
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { collapsed, mobileOpen, closeMobile, isMobile } = useSidebar();
  const { notificationsUnread } = useUnreadCounters();

  const role = (session?.user as any)?.role ?? "CLIENT";

  const filtered = React.useMemo(() => {
    return NAV_ITEMS
      .map((it) => {
        if (isGroup(it)) {
          const children = (it.children || []).filter((c) => isAllowed((c as any).showFor, role));
          if (children.length === 0) return null;
          return { ...it, children };
        }
        if (isEntry(it)) {
          return isAllowed((it as any).showFor, role) ? it : null;
        }
        return null;
      })
      .filter(Boolean) as any[];
  }, [role]);

  const flatEntries = React.useMemo(() => {
    const out: Array<{ key: string; href: string }> = [];
    for (const it of filtered) {
      if (isGroup(it)) {
        for (const c of it.children) if (isEntry(c)) out.push({ key: c.key, href: c.href });
      } else if (isEntry(it)) out.push({ key: it.key, href: it.href });
    }
    return out;
  }, [filtered]);

  const activeKey = React.useMemo(() => {
    let best: string | null = null;
    let bestLen = -1;
    for (const it of flatEntries) {
      if (pathname === it.href || pathname.startsWith(it.href + "/")) {
        if (it.href.length > bestLen) {
          best = it.key;
          bestLen = it.href.length;
        }
      }
    }
    return best;
  }, [flatEntries, pathname]);

  const itemBadge = (key: string) => (key === "messages" ? notificationsUnread : 0);

  const EntryLink: React.FC<{ it: any }> = ({ it }) => {
    const isActive = activeKey === it.key;
    const badge = itemBadge(it.key);
    const ref = React.useRef<HTMLAnchorElement>(null);

    const setHover = (on: boolean) => {
      if (!ref.current) return;
      ref.current.style.transform = on ? "translateY(-1px)" : "translateY(0)";
      ref.current.style.borderColor = on ? "var(--border-strong, var(--border))" : "var(--border)";
      if (on && !isActive) ref.current.style.background = "var(--panel, rgba(0,0,0,0.04))";
      if (!on && !isActive) ref.current.style.background = "transparent";
    };
    const setFocus = (on: boolean) => {
      if (!ref.current) return;
      ref.current.style.boxShadow = on ? "0 0 0 2px rgba(59,130,246,.45)" : "none";
    };

    return (
      <Link
        ref={ref}
        key={it.key}
        href={it.href}
        title={it.label}
        aria-current={isActive ? "page" : undefined}
        className="fp-nav-item"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 40,
          borderRadius: 10,
          padding: collapsed ? "0 10px" : "0 12px",
          border: "1px solid var(--border)",
          background: isActive ? "var(--panel, rgba(0,0,0,0.06))" : "transparent",
          transition: "background .15s ease, transform .15s ease, border-color .15s ease, box-shadow .15s ease",
          position: "relative",
          outline: "none",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        <NavIcon name={it.icon} />
        {!collapsed && (
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: isActive ? 700 : 500,
            }}
          >
            {it.label}
          </span>
        )}
        {badge > 0 &&
          (collapsed ? (
            <span
              aria-label={`${badge} por ler`}
              title={`${badge} por ler`}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "var(--badge-fg, #ef4444)",
              }}
            />
          ) : (
            <span
              aria-label={`${badge} por ler`}
              title={`${badge} por ler`}
              style={{
                marginLeft: "auto",
                borderRadius: 999,
                fontSize: 11,
                lineHeight: 1,
                padding: "3px 6px",
                border: "1px solid var(--border)",
                background: "var(--badge-bg, rgba(239,68,68,.12))",
                color: "var(--badge-fg, #ef4444)",
                fontWeight: 700,
              }}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          ))}
      </Link>
    );
  };

  const GroupBlock: React.FC<{ it: any; idx: number }> = ({ it, idx }) => {
    if (collapsed) {
      return (
        <div key={it.key} style={{ display: "grid", gap: 6 }}>
          {idx > 0 && (
            <div
              aria-hidden
              style={{
                height: 1,
                background: "var(--border)",
                opacity: 0.7,
                margin: "4px 6px",
                borderRadius: 1,
              }}
            />
          )}
          {(it.children || [])
            .filter((c: any) => isEntry(c))
            .map((c: any) => (
              <EntryLink key={c.key} it={c} />
            ))}
        </div>
      );
    }
    return (
      <div key={it.key} style={{ display: "grid", gap: 6 }}>
        <div
          aria-hidden
          style={{
            margin: "8px 4px 2px",
            fontSize: 11,
            letterSpacing: 0.3,
            textTransform: "uppercase",
            color: "var(--muted)",
            fontWeight: 700,
          }}
        >
          {it.label}
        </div>
        {(it.children || [])
          .filter((c: any) => isEntry(c))
          .map((c: any) => (
            <EntryLink key={c.key} it={c} />
          ))}
      </div>
    );
  };

  const body = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ overflowY: "auto", padding: 10, paddingTop: 12 }}>
        <nav style={{ display: "grid", gap: 6 }}>
          {filtered.map((it, idx) => {
            if (isGroup(it)) return <GroupBlock key={it.key} it={it} idx={idx} />;
            if (isEntry(it)) return <EntryLink key={it.key} it={it} />;
            return null;
          })}
        </nav>
      </div>

      <div
        style={{
          marginTop: "auto",
          padding: 10,
          borderTop: "1px solid var(--border)",
          background: "var(--bg)",
          position: "sticky",
          bottom: 0,
        }}
      >
        <div style={{ width: "100%" }}>
          <SignOutButton label={collapsed ? "Sair" : "Terminar sessão"} />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        role="dialog"
        aria-label="Menu"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      >
        <div
          onClick={closeMobile}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            opacity: mobileOpen ? 1 : 0,
            transition: "opacity .2s ease",
          }}
        />
        <aside
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: W,
            maxWidth: "85vw",
            background: "var(--bg)",
            borderRight: "1px solid var(--border)",
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform .2s ease",
            boxShadow: "0 10px 30px rgba(0,0,0,.15)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <strong style={{ fontSize: 14, opacity: 0.85, paddingLeft: 4 }}>Menu</strong>
            <button
              aria-label="Fechar menu"
              onClick={closeMobile}
              style={{
                width: 32,
                height: 32,
                display: "grid",
                placeItems: "center",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
              }}
            >
              <X size={16} />
            </button>
          </div>
          {body}
        </aside>
      </div>
    );
  }

  return (
    <aside
      style={{
        width: collapsed ? W_MIN : W,
        borderRight: "1px solid var(--border)",
        background: "var(--bg)",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        transition: "width .18s ease",
      }}
    >
      {body}
    </aside>
  );
}
