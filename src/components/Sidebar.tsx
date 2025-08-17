"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Shield,
  CheckCircle,
  Users,
  BarChart2,
  Settings,
  FileText,
  Bell,
  ChevronRight,
} from "lucide-react";

type NavLeaf = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

type NavGroup = {
  title: string;
  items: NavLeaf[];
};

function Item({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link
      href={href}
      className="nav-item"
      data-active={active ? "true" : "false"}
      aria-current={active ? "page" : undefined}
    >
      <span className="nav-icon"><Icon size={18} aria-hidden="true" /></span>
      <span className="nav-label">{label}</span>
      <span className="nav-caret" aria-hidden="true"><ChevronRight size={16} /></span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || "/";

  // Define grupos dentro do useMemo para não gerar warnings de deps
  const groups = useMemo<NavGroup[]>(() => {
    const grpHome: NavGroup = {
      title: "Geral",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: Home, exact: true },
        { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
        { href: "/dashboard/notificacoes", label: "Notificações", icon: Bell },
      ],
    };

    const grpPT: NavGroup = {
      title: "Personal Trainer",
      items: [
        { href: "/dashboard/pt/clients", label: "Clientes", icon: Users },
        { href: "/dashboard/pt/plans", label: "Planos de treino", icon: CheckCircle },
        { href: "/dashboard/pt/library", label: "Biblioteca", icon: FileText },
      ],
    };

    const grpAdmin: NavGroup = {
      title: "Administração",
      items: [
        { href: "/dashboard/admin/users", label: "Utilizadores", icon: Users },
        { href: "/dashboard/admin/approvals", label: "Aprovações", icon: CheckCircle },
        { href: "/dashboard/admin/reports", label: "Relatórios", icon: BarChart2 },
        { href: "/dashboard/admin/settings", label: "Definições", icon: Settings },
      ],
    };

    const grpSystem: NavGroup = {
      title: "Sistema",
      items: [
        { href: "/dashboard/system/health", label: "Saúde do sistema", icon: Shield },
        { href: "/dashboard/system/logs", label: "Logs de auditoria", icon: FileText },
      ],
    };

    return [grpHome, grpPT, grpAdmin, grpSystem];
  }, []);

  const isActive = (item: NavLeaf) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="fp-nav" aria-label="Navegação principal">
      {groups.map((g) => (
        <section className="nav-section" key={g.title}>
          <div className="nav-section-title">{g.title}</div>
          <div className="nav-list">
            {g.items.map((it) => (
              <Item key={it.href} href={it.href} label={it.label} icon={it.icon} active={isActive(it)} />
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
}
