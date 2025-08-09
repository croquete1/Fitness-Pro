// src/app/admin/layout.tsx
import { type ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin — Fitness Pro",
  description: "Área de administração da plataforma Fitness Pro",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Obtém a sessão no servidor (seguro e sem piscar no UI)
  const session = await getServerSession(authOptions);

  // Sem sessão → enviar para login
  if (!session?.user) {
    redirect("/login");
  }

  // RBAC: apenas 'admin' pode aceder
  const role = (session.user as { role?: "cliente" | "pt" | "admin" }).role ?? "cliente";
  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh">
      {children}
    </div>
  );
}
