"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";
import { useSession } from "next-auth/react";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import SignOutButton from "@/components/auth/SignOutButton";
import { NavIcon } from "./icons";

// Larguras
const W = 272;
const W_MIN = 76;

// Helpers de tipo
function isGroup(
  it: any
): it is { key: string; label: string; children: any[]; showFor?: string[] } {
  return Array.isArray((it as any)?.children);
}
function isEntry(
  it: any
): it is { key: string; label: string; href: string; icon?: string; showFor?: string[] } {
  return typeof (it as any)?.href === "string";
}
function isAllowed(showFor: string[] | undefined, role: string) {
  if (!showFor || showFor.length === 0) return true;
  return showFor.includes("ALL") || showFor.includes(role);
}

// Cores de ícones por chave (suaves, tema-agnósticas)
const iconColor: Record<string, string> = {
  dashboard: "#4f46e5",
  sessions: "#0ea5e9",
  messages: "#a855f7",
  plans: "#22c55e",
  library: "#3b82f6",
  admins: "#f59e0b",
  users: "#f97316",
  reports: "#06b6d4",
  exercises: "#ef4444",
  metrics: "#84cc16",
  profile: "#14b8a6",
  settings: "#64748b",
  system: "#94a3b8",
  tools: "#eab308",
  notifications: "#f43f5e",
  logout: "#64748b",
};

// Badge por item (ex.: mensagens não lidas)
function useUnreadCounters() {
  const [msg, setMsg] = React.useState(0);
  const fetcher = React.useCallback(async () => {
    try {
      const r = await fetch("/api/dashboard/counters", { cache: "no-store" });
      const j = await r.json();
      setMsg(Number(j?.data?.notificationsUnread ?? 0));
    } catch {}
  }, []);
  React.useEffect(() => {
    fetcher();
    const iv = setInterval(fetcher, 20000);
    const vis = () => document.visibilityState === "visible" && fetcher();
    document.addEventListener("visibilitychange", vis);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [fetcher]);
  return { notificationsUnread: msg };
}

// --- Sidebar ---
export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "CLIENT";

  const { collapsed, mobileOpen, closeMobile, isMobile } = useSidebar();
  const { notificationsUnread } = useUnreadCounters();

  // Filtra NAV_ITEMS por role
  const filtered = React.useMemo(() => {
    return NAV_ITEMS
      .map((it) => {
        if (isGroup(it)) {
          const children = (it.children || []).filter((c) => isAllowed((c as any).showFor, role));
          if (children.length === 0) return null;
          return { ...it, children };
        }
        if (isEntry(it)) return isAllowed((it as any).showFor, role) ? it : null;
        return null;
      })
      .filter(Boolean) as any[];
  }, [role]);

  // Lista plana para “active match”
  const flatEntries = React.useMemo(() => {
    const out: Array<{ key: string; href: string }> = [];
    for (const it of filtered) {
      if (isGroup(it)) {
        for (const c of it.children) if (isEntry(c)) out.push({ key: c.key, href: c.href });
      } else if (isEntry(it)) out.push({ key: it.key, href: it.href });
    }
    return out;
  }, [filtered]);

  // Active key = longest prefix match do pathname
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

  // Estado de grupos (expandido/colapsado), persiste em localStorage
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("fp:sidebar:groups");
      if (raw) setOpenGroups(JSON.parse(raw));
    } catch {}
  }, []);
  const setGroupOpen = React.useCallback((key: string, open: boolean) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [key]: open };
      try {
        localStorage.setItem("fp:sidebar:groups", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Tooltip quando colapsada
  const asideRef = React.useRef<HTMLElement | null>(null);
  const [tip, setTip] = React.useState<{ text: string; top: number; show: boolean }>({
    text: "",
    top: 0,
    show: false,
  });
  const showTip = (label: string, el: HTMLElement | null) => {
    if (!collapsed || !asideRef.current || !el) return;
    const r = el.getBoundingClientRect();
    const b = asideRef.current.getBoundingClientRect();
    setTip({ text: label, top: r.top - b.top + r.height / 2, show: true });
  };
  const hideTip = () => setTip((t) => ({ ...t, show: false }));

  const badgeFor = (key: string) => (key === "messages" ? notificationsUnread : 0);

  // Item individual
  const EntryLink: React.FC<{ it: any; depth?: number }> = ({ it, depth = 0 }) => {
    const isActive = activeKey === it.key;
    const badge = badgeFor(it.key);
    const ref = React.useRef<HTMLAnchorElement>(null);
    const color = iconColor[it.icon ?? it.key] || "#64748b";

    const setHover = (on: boolean) => {
      if (!ref.current) return;
      ref.current.style.transform = on ? "translateY(-1px)" : "translateY(0)";
      ref.current.style.borderColor = on ? "var(--border-strong, var(--border))" : "var(--border)";
      if (on && !isActive) ref.current.style.background = "var(--panel, rgba(0,0,0,.045))";
      if (!on && !isActive) ref.current.style.background = "transparent";
      if (on) showTip(it.label, ref.current);
      else hideTip();
    };

    return (
      <Link
        ref={ref}
        href={it.href}
        title={it.label}
        aria-current={isActive ? "page" : undefined}
        className="fp-nav-item"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 42,
          borderRadius: 12,
          padding: collapsed ? "0 10px" : "0 12px",
          border: "1px solid var(--border)",
          background: isActive
            ? "linear-gradient(180deg, rgba(99,102,241,0.14), rgba(99,102,241,0.10))"
            : "transparent",
          transition:
            "background .15s ease, transform .15s ease, border-color .15s ease, box-shadow .15s ease",
          position: "relative",
          outline: "none",
          marginLeft: collapsed ? 0 : depth * 10,
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* faixa de acento quando ativo */}
        {isActive && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: 6,
              bottom: 6,
              width: 4,
              borderRadius: 4,
              background: color,
            }}
          />
        )}

        {/* ícone dentro de “pill” suave */}
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            background: `${color}1A`, // ~10% opacity
          }}
        >
          <NavIcon name={it.icon} color={color} />
        </span>

        {!collapsed && (
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "var(--fg)" : "inherit",
            }}
          >
            {it.label}
          </span>
        )}

        {/* Badge */}
        {!collapsed && badge > 0 && (
          <span
            title={`${badge} por ler`}
            style={{
              marginLeft: "auto",
              borderRadius: 999,
              fontSize: 11,
              lineHeight: 1,
              padding: "4px 7px",
              border: "1px solid var(--border)",
              background: "var(--badge-bg, rgba(239,68,68,.12))",
              color: "var(--badge-fg, #ef4444)",
              fontWeight: 700,
            }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  // Bloco de grupo (accordion)
  const GroupBlock: React.FC<{ it: any; idx: number }> = ({ it, idx }) => {
    const open = !!openGroups[it.key];

    // quando colapsada, mostramos só os filhos (ícones) sem o header
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
                margin: "6px 6px",
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
      <div key={it.key} style={{ display: "grid", gap: 8 }}>
        {/* cabeçalho do grupo */}
        <button
          onClick={() => setGroupOpen(it.key, !open)}
          aria-expanded={open}
          aria-controls={`grp-${it.key}`}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            border: "1px solid var(--border)",
            background: "var(--bg)",
            height: 38,
            borderRadius: 10,
            padding: "0 10px",
            textAlign: "left",
            gap: 8,
          }}
          onMouseEnter={(e) => showTip(it.label, e.currentTarget)}
          onMouseLeave={hideTip}
          title={it.label}
        >
          <span
            aria-hidden
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              display: "grid",
              placeItems: "center",
              background: "var(--panel, rgba(0,0,0,.045))",
            }}
          >
            <ChevronRight
              size={16}
              style={{ transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform .15s" }}
            />
          </span>
          <span
            style={{
              fontSize: 12,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              color: "var(--muted)",
              fontWeight: 800,
            }}
          >
            {it.label}
          </span>
        </button>

        {/* filhos */}
        <div
          id={`grp-${it.key}`}
          style={{
            display: "grid",
            gap: 6,
            maxHeight: open ? 800 : 0,
            overflow: "hidden",
            transition: "max-height .18s ease",
          }}
        >
          {(it.children || [])
            .filter((c: any) => isEntry(c))
            .map((c: any) => (
              <EntryLink key={c.key} it={c} depth={1} />
            ))}
        </div>
      </div>
    );
  };

  // Corpo da sidebar
  const body = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* lista */}
      <div style={{ overflowY: "auto", padding: 10, paddingTop: 12 }}>
        <nav style={{ display: "grid", gap: 8 }}>
          {filtered.map((it, idx) => {
            if (isGroup(it)) return <GroupBlock key={it.key} it={it} idx={idx} />;
            if (isEntry(it)) return <EntryLink key={it.key} it={it} />;
            return null;
          })}
        </nav>
      </div>

      {/* footer fixo */}
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
        <SignOutButton label={collapsed ? "Sair" : "Terminar sessão"} />
      </div>

      {/* tooltip (apenas quando colapsada) */}
      {collapsed && tip.show && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: tip.top,
            left: W_MIN - 6,
            transform: "translateY(-50%)",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            padding: "6px 8px",
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "nowrap",
            zIndex: 5,
          }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );

  // Drawer mobile
  if (isMobile) {
    return (
      <div
        role="dialog"
        aria-label="Menu"
        style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: mobileOpen ? "auto" : "none" }}
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
          ref={asideRef}
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

  // Sidebar desktop
  return (
    <aside
      ref={asideRef}
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
