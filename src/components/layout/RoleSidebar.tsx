"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import SidebarAdmin from "@/components/layout/SidebarAdmin";
import SidebarPT from "@/components/layout/SidebarPT";
import SidebarClient from "@/components/layout/SidebarClient";
import "./sidebar.css";

/**
 * Escolhe a sidebar pelo ROLE da sessão:
 *  - "admin" → SidebarAdmin
 *  - "pt"    → SidebarPT
 *  - "client" (ou indefinido) → SidebarClient
 *
 * Fallback: enquanto a sessão está a carregar, usa o path
 * (/dashboard/admin/** ou /dashboard/pt/**) para evitar piscar.
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
