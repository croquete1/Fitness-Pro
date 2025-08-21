"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import SidebarPT from "@/components/layout/SidebarPT";
import SidebarClient from "@/components/layout/SidebarClient";

function normalizeRole(r?: string | null) {
  if (!r) return undefined;
  const v = r.toString().toLowerCase();
  if (v === "admin" || v === "administrator" || v === "adm") return "admin";
  if (v === "pt" || v === "trainer" || v === "treinador" || v === "coach") return "pt";
  if (v === "client" || v === "cliente" || v === "user") return "client";
  return undefined;
}

export default function RoleSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const roleFromSession = normalizeRole((session?.user as any)?.role);
  const roleFromPath = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/pt")
    ? "pt"
    : "client";

  const role = roleFromSession ?? (status === "loading" ? roleFromPath : "client");

  if (role === "admin") return <SidebarAdmin />;
  if (role === "pt") return <SidebarPT />;
  return <SidebarClient />;
}
