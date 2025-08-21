"use client";

import React from "react";
import SidebarBase from "@/components/layout/SidebarBase";

const NAV = [
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
  return (
    <SidebarBase
      nav={NAV}
      showToggle
      logoSrc="/logo.png"
      brandName="Fitness Pro"
      brandSub="Cliente"
    />
  );
}
