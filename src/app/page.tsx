// src/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

// Garante rendering por pedido (evita cache/SSG em páginas com sessão)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    // Já autenticado: segue para a dashboard
    redirect("/dashboard");
  }

  // Não autenticado: ir para login (sem callbackUrl)
  redirect("/login");
}
