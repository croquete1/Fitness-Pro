"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import SidebarPT from "@/components/layout/SidebarPT";
import SidebarClient from "@/components/layout/SidebarClient";
import { toAppRole } from "@/lib/roles";

export default function RoleSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const roleFromPath =
    pathname.startsWith("/dashboard/admin") ? "admin" :
    pathname.startsWith("/dashboard/pt")    ? "pt"    : "client";

  const raw = (session?.user as any)?.role ?? (status === "loading" ? roleFromPath : "client");
  const role = toAppRole(raw);

  if (role === "admin") return <SidebarAdmin />;
  if (role === "pt") return <SidebarPT />;
  return <SidebarClient />;
}
