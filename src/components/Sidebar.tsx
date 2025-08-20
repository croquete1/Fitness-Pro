// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

type Role = "ADMIN" | "TRAINER" | "CLIENT" | string;

type Item = {
  href: string;
  label: string;
  emoji: string;
  match?: "exact" | "prefix";
};
type Section = { title?: string; items: Item[] };

async function resolveRoleSafely(): Promise<Role> {
  // tenta next-auth via import dinâmico (não requer Provider)
  try {
    const mod = await import("next-auth/react");
    const s = await mod.getSession();
    const r =
      (s?.user as any)?.role ||
      (s?.user as any)?.type ||
      (s as any)?.role ||
      null;
    if (r) return String(r).toUpperCase();
  } catch {}
  // fallback: endpoint de sessão
  try {
    const r = await fetch("/api/auth/session", { credentials: "include" });
    if (r.ok) {
      const j = await r.json();
      const role =
        j?.user?.role || j?.user?.type || j?.role || j?.type || "CLIENT";
      return String(role).toUpperCase();
    }
  } catch {}
  return "CLIENT";
}

function isActive(pathname: string, href: string, match: Item["match"]) {
  if (match === "exact") return pathname === href;
  return pathname.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>("CLIENT"); // por omissão o mais restritivo

  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await resolveRoleSafely();
      if (!cancel) setRole(r);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const sections: Section[] = useMemo(() => {
    // Gerais (toda a gente)
    const general: Section = {
      title: "GERAL",
      items: [
        { href: "/dashboard", label: "Dashboard", emoji: "📊", match: "exact" },
        { href: "/dashboard/reports", label: "Relatórios", emoji: "📄", match: "prefix" },
        { href: "/dashboard/settings", label: "Definições", emoji: "⚙️", match: "prefix" },
      ],
    };

    // PT
    const pt: Section = {
      title: "PT",
      items: [
        { href: "/dashboard/clients", label: "Clientes", emoji: "🧑‍🤝‍🧑", match: "prefix" },
        { href: "/dashboard/plans", label: "Planos", emoji: "🧱", match: "prefix" },
        { href: "/dashboard/library", label: "Biblioteca", emoji: "📚", match: "prefix" },
      ],
    };

    // Admin
    const admin: Section = {
      title: "ADMIN",
      items: [
        { href: "/dashboard/admin/approvals", label: "Aprovações", emoji: "✅", match: "prefix" },
        { href: "/dashboard/admin/users", label: "Utilizadores", emoji: "👥", match: "prefix" },
      ],
    };

    // Sistema (apenas admin)
    const system: Section = {
      title: "SISTEMA",
      items: [{ href: "/dashboard/system", label: "Saúde do sistema", emoji: "🧰", match: "prefix" }],
    };

    // Composição por role
    const r = String(role).toUpperCase();
    if (r === "ADMIN") {
      return [general, pt, admin, system];
    }
    if (r === "TRAINER") {
      return [general, pt]; // sem Admin, sem Sistema
    }
    // CLIENT (ou desconhecido)
    return [
      // cliente vê o básico; remove PT/Admin/Sistema
      {
        title: "GERAL",
        items: [
          { href: "/dashboard", label: "Dashboard", emoji: "📊", match: "exact" },
          { href: "/dashboard/library", label: "Biblioteca", emoji: "📚", match: "prefix" },
        ],
      },
    ];
  }, [role]);

  return (
    <nav className="fp-nav">
      {sections.map((s, idx) => (
        <div key={idx} className="nav-group">
          {s.title && <div className="nav-section">{s.title}</div>}
          {s.items.map((it) => {
            const active = isActive(pathname, it.href, it.match ?? "prefix");
            return (
              <Link key={it.href} href={it.href} className="nav-item" data-active={active ? "true" : undefined}>
                <span className="nav-icon nav-emoji" aria-hidden>
                  {it.emoji}
                </span>
                <span className="nav-label">{it.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
