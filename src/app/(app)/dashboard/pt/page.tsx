import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { toAppRole } from "@/lib/roles";

export default async function PTClientesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = toAppRole((session.user as any)?.role);

  // Apenas PT (ou Admin) pode ver esta página
  if (role !== "pt" && role !== "admin") {
    redirect("/dashboard");
  }

  // ➜ Aqui manténs o teu conteúdo atual da página PT (cards, tabelas, etc.)
  // Podes buscar dados server-side conforme o role:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/pt/clients`, { cache: "no-store" });
  // const data = await res.json();

  return (
    <div>
      <h1>Área do Personal Trainer</h1>
      <p>Bem-vindo! ({role})</p>
      {/* Render do teu conteúdo existente vai aqui */}
    </div>
  );
}
