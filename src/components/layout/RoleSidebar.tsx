"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SidebarAdmin from "@/components/sidebars/SidebarAdmin";
import SidebarPT from "@/components/sidebars/SidebarPT";
import SidebarClient from "@/components/sidebars/SidebarClient";

// normaliza possíveis formatos de role
function normalizeRole(r?: string | null) {
  if (!r) return undefined;
  const v = r.toString().toLowerCase();
  if (v === "admin" || v === "administrator" || v === "adm") return "admin";
  if (v === "pt" || v === "trainer" || v === "treinador" || v === "coach" || v === "trainer_user" || v === "trainerrole")
    return "pt";
  if (v === "client" || v === "cliente" || v === "user") return "client";
  if (v === "trainer") return "pt";
  if (v === "admin".toUpperCase()) return "admin";
  return undefined;
}

export default function RoleSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const roleFromSession = normalizeRole((session?.user as any)?.role);
  const roleFromPath =
    pathname.startsWith("/dashboard/admin")
      ? "admin"
      : pathname.startsWith("/dashboard/pt")
      ? "pt"
      : "client";

  const role = roleFromSession ?? (status === "loading" ? roleFromPath : "client");

  if (role === "admin") return <SidebarAdmin />;
  if (role === "pt") return <SidebarPT />;
  return <SidebarClient />;
}
