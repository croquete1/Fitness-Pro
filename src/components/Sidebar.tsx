'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pin, PinOff } from "lucide-react";
// importar sem quebrar quando não há Provider
import * as NextAuthReact from "next-auth/react";
import { useSidebar } from "./SidebarWrapper";

type Role = "ADMIN" | "TRAINER" | "CLIENT";

const NAV_ADMIN = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/reports", label: "Relatórios", icon: "🧾" },
  { href: "/dashboard/settings", label: "Definições", icon: "⚙️" },
  { section: "PT" as const },
  { href: "/dashboard/pt/clients", label: "Clientes", icon: "🧑‍🤝‍🧑" },
  { href: "/dashboard/pt/plans", label: "Planos", icon: "🧱" },
  { href: "/dashboard/pt/library", label: "Biblioteca", icon: "📚" },
  { section: "ADMIN" as const },
  { href: "/dashboard/admin/approvals", label: "Aprovações", icon: "✅" },
  { href: "/dashboard/admin/users", label: "Utilizadores", icon: "👥" },
  { section: "SISTEMA" as const },
  { href: "/dashboard/system/health", label: "Saúde do sistema", icon: "🧰" },
];

const NAV_TRAINER = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/pt/clients", label: "Clientes", icon: "🧑‍🤝‍🧑" },
  { href: "/dashboard/pt/plans", label: "Planos", icon: "🧱" },
  { href: "/dashboard/pt/library", label: "Biblioteca", icon: "📚" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, pinned, togglePinned } = useSidebar();

  // pegar hook com fallback seguro
  const useSession = (NextAuthReact as any)?.useSession as (() => any) | undefined;
  const session = useSession ? useSession() : undefined;
  const role = ((session?.data?.user?.role as Role) || "ADMIN") as Role;

  const items = role === "TRAINER" ? NAV_TRAINER : NAV_ADMIN;

  const isActive = (href?: string) =>
    href ? (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)) : false;

  return (
    <div>
      {/* Cabeçalho da sidebar */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <img src="/logo.svg" alt="Fitness Pro" className="logo" />
          {/* label escondido quando encolhida, graças ao CSS */}
          <strong>Fitness Pro</strong>
        </div>
        <div className="fp-sb-actions">
          {/* Encolher/expandir (mostrar só ícones) */}
          <button
            type="button"
            className="btn icon"
            aria-label={collapsed ? "Expandir menu" : "Encolher menu"}
            title={collapsed ? "Expandir" : "Encolher"}
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              try {
                localStorage.setItem("fp:sb:collapsed", next ? "1" : "0");
                document.documentElement.setAttribute("data-sb-collapsed", next ? "1" : "0");
              } catch {}
            }}
          >
            {/* ícone que sugere “mostrar/ocultar nomes” */}
            {collapsed ? "›" : "‹"}
          </button>

          {/* Afixar (pinned) — mantém expandida mesmo após hover-out */}
          <button
            type="button"
            className="btn icon"
            aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
            title={pinned ? "Desafixar" : "Afixar"}
            onClick={() => {
              togglePinned();
              try {
                localStorage.setItem("fp:sb:pinned", !pinned ? "1" : "0");
              } catch {}
            }}
          >
            {pinned ? <PinOff size={18} /> : <Pin size={18} />}
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        {items.map((it, i) =>
          // separadores (secções)
          (it as any).section ? (
            <div key={`sec-${i}`} className="nav-section">
              {(it as any).section}
            </div>
          ) : (
            <Link
              key={it.href}
              href={it.href!}
              className="nav-item"
              data-active={isActive(it.href) ? "true" : "false"}
            >
              <span className="nav-icon" aria-hidden>{it.icon}</span>
              <span className="nav-label">{it.label}</span>
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
