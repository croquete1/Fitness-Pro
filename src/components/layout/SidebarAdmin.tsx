"use client";
import SidebarBase, { Group } from "@/components/layout/SidebarBase";

const NAV: Group[] = [
  {
    title: "GERAL",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <span className="nav-emoji">📊</span>, exact: true },
      { href: "/dashboard/reports", label: "Relatórios", icon: <span className="nav-emoji">🧾</span> },
      { href: "/dashboard/settings", label: "Definições", icon: <span className="nav-emoji">⚙️</span> },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { href: "/dashboard/admin/approvals", label: "Aprovações", icon: <span className="nav-emoji">✅</span> },
      { href: "/dashboard/admin/users", label: "Utilizadores", icon: <span className="nav-emoji">👥</span> },
    ],
  },
  {
    title: "SISTEMA",
    items: [{ href: "/dashboard/system/health", label: "Saúde do sistema", icon: <span className="nav-emoji">🧰</span> }],
  },
];

export default function SidebarAdmin() {
  return <SidebarBase nav={NAV} showToggle />;
}
