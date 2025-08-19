"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarState } from "./SidebarWrapper";

type NavItem = { label: string; href: string; icon: React.ReactNode };
type NavGroup = { title?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "GERAL",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <span className="nav-icon">📊</span> },
      { label: "Relatórios", href: "/dashboard/reports", icon: <span className="nav-icon">🧾</span> },
      { label: "Definições", href: "/dashboard/settings", icon: <span className="nav-icon">⚙️</span> },
    ],
  },
  {
    title: "PT",
    items: [
      { label: "Clientes", href: "/dashboard/pt/clients", icon: <span className="nav-icon">🧑‍🤝‍🧑</span> },
      { label: "Planos", href: "/dashboard/pt/plans", icon: <span className="nav-icon">🧱</span> },
      { label: "Biblioteca", href: "/dashboard/pt/library", icon: <span className="nav-icon">📚</span> },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { label: "Aprovações", href: "/dashboard/admin/approvals", icon: <span className="nav-icon">✅</span> },
      { label: "Utilizadores", href: "/dashboard/users", icon: <span className="nav-icon">👥</span> },
    ],
  },
  {
    title: "SISTEMA",
    items: [{ label: "Saúde do sistema", href: "/dashboard/system/health", icon: <span className="nav-icon">🩺</span> }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned, setCollapsed } = useSidebarState();

  // Coloca o atributo data-collapsed diretamente na <aside.fp-sidebar>
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".fp-sidebar");
    if (el) el.setAttribute("data-collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  // Botão "pin": fixa/desfixa E sincroniza a vista (pinned=true => expandida; pinned=false => rail)
  const onTogglePin = () => {
    const nextPinned = !pinned;
    togglePinned();
    setCollapsed(!nextPinned); // se ficou pinned -> expandir; se despin -> encolher
  };

  return (
    <>
      {/* Cabeçalho / marca */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <div className="logo">💪</div>
          {/* título só aparece quando não está colapsada (CSS faz o resto) */}
          <div className="nav-label" aria-hidden={collapsed}>Fitness Pro</div>
        </div>

        <div className="fp-sb-actions">
          {/* hambúrguer — só colapsa/expande */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            className="btn icon"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            <span>≡</span>
          </button>

          {/* pin — fixa / desafixa e ajusta visual */}
          <button
            type="button"
            onClick={onTogglePin}
            aria-pressed={pinned}
            aria-label={pinned ? "Desafixar sidebar" : "Afixar sidebar"}
            className="btn icon"
            title={pinned ? "Desafixar" : "Afixar"}
          >
            <span>{pinned ? "📌" : "📍"}</span>
          </button>
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav">
        {NAV.map((group, i) => (
          <div key={i} className="nav-group">
            {group.title ? <div className="nav-section">{group.title}</div> : null}

            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
              return (
                <Link key={item.href} href={item.href} className="nav-item" data-active={active ? "true" : "false"}>
                  {item.icon}
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}
