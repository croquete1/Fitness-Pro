"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import SidebarPT from "@/components/layout/SidebarPT";
import SidebarClient from "@/components/layout/SidebarClient";
import { toAppRole } from "@/lib/roles";
import "./sidebar.css";

/**
 * Sidebar por role, robusta a ausência de SessionProvider (no build).
 * Agora usamos um acesso seguro ao hook, sem destructuring direto.
 */
export default function RoleSidebar() {
  // ⚠️ useSession() pode ser undefined se não houver Provider durante o build
  const sess: any = (useSession as any)?.() ?? {};
  const session = sess?.data ?? null;
  const status: "loading" | "authenticated" | "unauthenticated" =
    sess?.status ?? "unauthenticated";

  const pathname = usePathname();

  const roleFromPath =
    pathname.startsWith("/dashboard/admin")
      ? "admin"
      : pathname.startsWith("/dashboard/pt")
      ? "pt"
      : "client";

  const role = toAppRole(session?.user?.role ?? (status === "loading" ? roleFromPath : "client"));

  if (role === "admin") return <SidebarAdmin />;
  if (role === "pt") return <SidebarPT />;
  return <SidebarClient />;
}
