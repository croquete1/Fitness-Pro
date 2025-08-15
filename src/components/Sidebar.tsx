// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/admin", label: "Administração" },
  { href: "/dashboard/pt-clientes", label: "PT - Clientes" },
  { href: "/dashboard/sistema", label: "Sistema" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 256,
        flexShrink: 0,
        borderRight: "1px solid #e5e7eb",
        background: "#fafafa",
      }}
    >
      <div style={{ padding: 16, fontWeight: 600 }}>Fitness‑Pro</div>
      <nav style={{ display: "flex", flexDirection: "column" }}>
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "10px 16px",
                textDecoration: "none",
                color: "#111827",
                background: active ? "#f3f4f6" : "transparent",
                fontWeight: active ? 600 : 400,
              }}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
