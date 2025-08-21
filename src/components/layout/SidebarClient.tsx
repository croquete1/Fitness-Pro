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
];

export default function SidebarClient() {
  return <SidebarBase nav={NAV} showToggle />;
}
