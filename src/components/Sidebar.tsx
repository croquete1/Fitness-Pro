// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Props = { role?: string };

type Item = { href: string; label: string; icon: string };

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function Sidebar({ role }: Props) {
  const pathname = usePathname();

  // respeitar preferência guardada (quando a app carrega no cliente)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sb-collapsed");
      if (saved === "1" || saved === "0") {
        document.documentElement.setAttribute("data-sb-collapsed", saved);
      }
    } catch {}
  }, []);

  const geral: Item[] = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/reports", label: "Relatórios", icon: "🧾" },
    { href: "/dashboard/settings", label: "Definições", icon: "⚙️" },
  ];

  const pt: Item[] = [
    { href: "/dashboard/pt/clients", label: "Clientes", icon: "👥" },
    { href: "/dashboard/pt/plans", label: "Planos", icon: "🧱" },
    { href: "/dashboard/pt/library", label: "Biblioteca", icon: "📚" },
  ];

  const admin: Item[] = [
    { href: "/dashboard/admin/approvals", label: "Aprovações", icon: "✅" },
    { href: "/dashboard/admin/users", label: "Utilizadores", icon: "🧑‍🤝‍🧑" },
  ];

  const sistema: Item[] = [
    { href: "/dashboard/system/health", label: "Saúde do sistema", icon: "🩺" },
  ];

  const showPT = role === "TRAINER" || role === "ADMIN";
  const showAdmin = role === "ADMIN";

  const Section = ({ title, items }: { title: string; items: Item[] }) => (
    <>
      <div className="nav-section">{title}</div>
      <div className="nav-group">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="nav-item"
            data-active={isActive(pathname, it.href)}
          >
            <span className="nav-icon nav-emoji" aria-hidden>
              {it.icon}
            </span>
            <span className="nav-label">{it.label}</span>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <nav className="fp-nav">
      <Section title="GERAL" items={geral} />
      {showPT && <Section title="PT" items={pt} />}
      {showAdmin && <Section title="ADMIN" items={admin} />}
      <Section title="SISTEMA" items={sistema} />
    </nav>
  );
}
