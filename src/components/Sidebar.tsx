"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarState } from "./SidebarWrapper";
import { Pin, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Image from "next/image";

type Item =
  | { section: string }
  | { href: string; label: string; icon: string };

const NAV: Item[] = [
  { section: "GERAL" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/reports", label: "Relatórios", icon: "🧾" },
  { href: "/dashboard/settings", label: "Definições", icon: "⚙️" },

  { section: "PT" },
  { href: "/dashboard/pt/clients", label: "Clientes", icon: "🧑‍🤝‍🧑" },
  { href: "/dashboard/pt/plans", label: "Planos", icon: "🧱" },
  { href: "/dashboard/pt/library", label: "Biblioteca", icon: "📚" },

  { section: "ADMIN" },
  { href: "/dashboard/admin/approvals", label: "Aprovações", icon: "✅" },
  { href: "/dashboard/admin/users", label: "Utilizadores", icon: "👥" },

  { section: "SISTEMA" },
  { href: "/dashboard/system/health", label: "Saúde do sistema", icon: "🩺" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebarState();

  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho/brand da sidebar */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          {/* LOGO: coloca /public/logo.svg no projeto */}
          {/* Fallback: se não existir, o texto "Fitness Pro" continua visível */}
          <Image
            src="logo.png"
            alt="Fitness Pro"
            width={32}
            height={32}
            className="logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="font-semibold">Fitness Pro</div>
        </div>

        {/* Ações: “esconder nomes” e “afixar” */}
        <div className="fp-sb-actions">
          {/* substituir hamburger: ícone sugere “esconder nomes” */}
          <button
            type="button"
            className="btn icon"
            title={collapsed ? "Expandir (mostrar nomes)" : "Encolher (mostrar só ícones)"}
            aria-label={collapsed ? "Expandir" : "Encolher"}
            data-role="sb-toggle"
            onClick={toggleCollapsed}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* “Afixar”: funciona como o toggle, mas com feedback visual (pin inclinado quando expandido) */}
          <button
            type="button"
            className={`btn icon btn-pin ${!collapsed ? "is-pinned" : ""}`}
            title={!collapsed ? "Desafixar (mostrar só ícones)" : "Afixar (mostrar nomes)"}
            aria-label="Afixar/Desafixar"
            data-role="sb-pin"
            onClick={toggleCollapsed}
          >
            <Pin size={18} />
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        <div className="nav-group">
          {NAV.map((it, idx) => {
            if ("section" in it) {
              return (
                <div key={`sec-${idx}`} className="nav-section">
                  {it.section}
                </div>
              );
            }
            const active = pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className="nav-item"
                data-active={active ? "true" : undefined}
              >
                <span className="nav-icon nav-emoji" aria-hidden>
                  {it.icon}
                </span>
                <span className="nav-label">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
