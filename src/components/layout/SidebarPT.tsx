"use client";

import React from "react";
import SidebarBase, { Group } from "@/components/layout/SidebarBase";

const NAV: Group[] = [
  {
    title: "GERAL",
    items: [
      { href: "/dashboard/pt", label: "Dashboard", icon: <span className="nav-emoji">📊</span>, exact: true },
      { href: "/dashboard/settings", label: "Definições", icon: <span className="nav-emoji">⚙️</span> },
    ],
  },
  {
    title: "PT",
    items: [
      { href: "/dashboard/pt/clients", label: "Clientes", icon: <span className="nav-emoji">👫</span> },
      { href: "/dashboard/pt/plans", label: "Planos", icon: <span className="nav-emoji">🧱</span> },
      { href: "/dashboard/pt/library", label: "Biblioteca", icon: <span className="nav-emoji">📚</span> },
    ],
  },
];

export default function SidebarPT() {
  return <SidebarBase nav={NAV} showToggle />;
}
