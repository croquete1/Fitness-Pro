"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Item = { label: string; href: string; icon: React.ReactNode; title?: string };
type Group = { title?: string; items: Item[] };

function ItemLink({ item, current, rail }: { item: Item; current: boolean; rail: boolean }) {
  const inner = (
    <>
      <div className="nav-icon" aria-hidden>{item.icon}</div>
      <div className="nav-label">{item.label}</div>
      <div className="nav-caret" />
    </>
  );

  return rail ? (
    <Link href={item.href} className="nav-item tooltip" data-tip={item.title ?? item.label} aria-current={current ? "page" : undefined}>
      {inner}
    </Link>
  ) : (
    <Link href={item.href} className="nav-item" aria-current={current ? "page" : undefined}>
      {inner}
    </Link>
  );
}

export default function Sidebar({ rail }: { rail?: boolean }) {
  const pathname = usePathname();
  const is = (href: string) => pathname === href; // match EXATO (evita selecionar o “pai”)

  const inicio: Group = {
    title: "Início",
    items: [
      { label: "Início", href: "/dashboard", icon: "🏠" },
      { label: "Sessões", href: "/dashboard/sessions", icon: "🗓️" },
      { label: "Mensagens", href: "/dashboard/messages", icon: "💬" },
      { label: "Perfil", href: "/dashboard/profile", icon: "🧑" },
      { label: "Relatórios", href: "/dashboard/reports", icon: "📊" },
      { label: "Definições", href: "/dashboard/settings", icon: "⚙️" },
    ],
  };

  const admin: Group = {
    title: "Administração",
    items: [
      { label: "Administração", href: "/dashboard/admin", icon: "🛡️" },
      { label: "Aprovações", href: "/dashboard/admin/approvals", icon: "✅" },
      { label: "Exercícios", href: "/dashboard/admin/exercises", icon: "🏋️" },
      { label: "Planos (Admin)", href: "/dashboard/admin/plans", icon: "🗂️" },
      { label: "Escala/Equipa", href: "/dashboard/admin/roster", icon: "📅" },
      { label: "Utilizadores", href: "/dashboard/admin/users", icon: "👥" },
    ],
  };

  const pt: Group = {
    title: "PT",
    items: [
      { label: "PT", href: "/dashboard/pt", icon: "🧑‍🏫" },
      { label: "Clientes", href: "/dashboard/pt/clients", icon: "🧑‍🤝‍🧑" },
      { label: "Biblioteca", href: "/dashboard/pt/library", icon: "📚" },
      { label: "Planos", href: "/dashboard/pt/plans", icon: "📘" },
    ],
  };

  const sistema: Group = {
    title: "Sistema",
    items: [
      { label: "Sistema", href: "/dashboard/system", icon: "🖥️" },
      { label: "Logs", href: "/dashboard/system/logs", icon: "📄" },
    ],
  };

  const groups: Group[] = [inicio, admin, pt, sistema];

  return (
    <nav style={{ display: "grid", gap: 6 }}>
      {groups.map((g, i) => (
        <div key={i} style={{ display: "grid", gap: 4 }}>
          {g.title && <div className="section-title">{g.title}</div>}
          {g.items.map((it) => (
            <ItemLink key={it.href} item={it} current={is(it.href)} rail={!!rail} />
          ))}
        </div>
      ))}
    </nav>
  );
}
