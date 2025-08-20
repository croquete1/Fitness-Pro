"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

// ↴ As tuas sidebars estão diretamente em src/components/
import SidebarAdmin from "@/components/SidebarAdmin";
import SidebarPT from "@/components/SidebarPT";
import SidebarClient from "@/components/SidebarClient";

/**
 * Escolhe a sidebar pelo ROLE da sessão:
 *  - "admin" → SidebarAdmin
 *  - "pt"    → SidebarPT
 *  - "client" (ou indefinido) → SidebarClient
 *
 * Fallback: se a sessão ainda não chegou mas o path começa por /dashboard/admin ou /dashboard/pt,
 * usamos essa pista para evitar "piscar" a sidebar errada.
 */
export default function RoleSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const roleFromPath =
    pathname.startsWith("/dashboard/admin")
      ? "admin"
      : pathname.startsWith("/dashboard/pt")
      ? "pt"
      : "client";

  const role =
    (session?.user as any)?.role ??
    (status === "loading" ? roleFromPath : "client");

  if (role === "admin") return <SidebarAdmin />;
  if (role === "pt") return <SidebarPT />;
  return <SidebarClient />;
}
