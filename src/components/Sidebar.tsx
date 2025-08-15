// src/components/Sidebar.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SidebarClient from "./SidebarClient";
import type { Role } from "@prisma/client";

export default async function Sidebar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined; // "ADMIN" | "PT" | "CLIENT" | undefined
  return <SidebarClient initialRole={role as any} />;
}
