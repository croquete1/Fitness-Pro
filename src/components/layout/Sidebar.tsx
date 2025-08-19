"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, FileBarChart, Settings, Users, ClipboardList,
  BookOpen, BadgeCheck, UserCircle2, Activity
} from "lucide-react";

type Item = { label: string; href: string; icon: React.ReactNode };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: "GERAL",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <BarChart3 size={18} /> },
      { label: "Relatórios", href: "/dashboard/reports", icon: <FileBarChart size={18} /> },
      { label: "Definições", href: "/dashboard/settings", icon: <Settings size={18} /> },
    ],
  },
  {
    title: "PT",
    items: [
      { label: "Clientes", href: "/dashboard/pt/clients", icon: <Users size={18} /> },
      { label: "Planos", href: "/dashboard/pt/plans", icon: <ClipboardList size={18} /> },
      { label: "Biblioteca", href: "/dashboard/pt/library", icon: <BookOpen size={18} /> },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { label: "Aprovações", href: "/dashboard/admin/approvals", icon: <BadgeCheck size={18} /> },
      { label: "Utilizadores", href: "/dashboard/users", icon: <UserCircle2 size={18} /> },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { label: "Saúde do sistema", href: "/dashboard/system/health", icon: <Activity size={18} /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Cabeçalho/Brand */}
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <div className="logo">💪</div>
          <div className="nav-label" style={{ fontWeight: 800 }}>Fitness Pro</div>
        </div>
        <div className="fp-sb-actions" />
      </div>

      {/* Navegação */}
      <nav className="fp-nav" aria-label="Navegação principal">
        {groups.map((g) => (
          <div className="nav-group" key={g.title}>
            <div className="nav-section">{g.title}</div>
            {g.items.map((it) => (
              <Link key={it.href} href={it.href} className="nav-item" data-active={isActive(it.href)}>
                <span className="nav-icon">{it.icon}</span>
                <span className="nav-label">{it.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
}
