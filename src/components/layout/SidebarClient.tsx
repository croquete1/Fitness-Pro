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
    title: "CONTA",
    items: [
      { href: "/dashboard/account", label: "A minha conta", icon: <span className="nav-emoji">👤</span> },
      { href: "/dashboard/sessions", label: "Minhas sessões", icon: <span className="nav-emoji">🗓️</span> },
      { href: "/dashboard/payments", label: "Pagamentos", icon: <span className="nav-emoji">💳</span> },
    ],
  },
];

export default function SidebarClient() {
  return <SidebarBase nav={NAV} showToggle />;
}
