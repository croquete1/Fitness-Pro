// src/app/admin/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  // Se não houver sessão → /login
  if (!session?.user) {
    redirect("/login");
  }

  // O teu callback de session já mete Role (enum) no user
  const role = (session.user as { id: string; role: Role }).role;

  // RBAC: só ADMIN acede
  if (role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
