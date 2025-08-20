"use client";

import React from "react";
import SidebarBase, { Group } from "@/components/layout/SidebarBase";

const NAV: Group[] = [
  {
    title: "GERAL",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <span className="nav-emoji">📊</span>, exact: true },
      { href: "/dashboard/settings", label: "Definições", icon: <span className="nav-emoji">⚙️</span> },
    ],
  },
  {
    title: "A MINHA CONTA",
    items: [
      { href: "/dashboard/me/sessions", label: "Minhas sessões", icon: <span className="nav-emoji">🗓️</span> },
      { href: "/dashboard/me/plan", label: "Plano", icon: <span className="nav-emoji">🏋️</span> },
      { href: "/dashboard/me/progress", label: "Progresso", icon: <span className="nav-emoji">📈</span> },
      { href: "/dashboard/me/billing", label: "Pagamentos", icon: <span className="nav-emoji">💳</span> },
    ],
  },
];

export default function SidebarClient() {
  return <SidebarBase nav={NAV} showToggle />;
}
