import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <main className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Administração</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/admin/approvals" className="rounded-xl border p-4 hover:shadow-sm transition">
          <div className="text-sm opacity-70">Moderação</div>
          <div className="text-lg font-semibold">Aprovações de conta</div>
          <p className="text-sm opacity-70 mt-1">Aprovar / rejeitar registos pendentes.</p>
        </Link>

        <Link href="/dashboard/reports" className="rounded-xl border p-4 hover:shadow-sm transition">
          <div className="text-sm opacity-70">Relatórios</div>
          <div className="text-lg font-semibold">Estatísticas e exportações</div>
          <p className="text-sm opacity-70 mt-1">Visão geral e CSV/PDF.</p>
        </Link>

        <Link href="/dashboard/system" className="rounded-xl border p-4 hover:shadow-sm transition">
          <div className="text-sm opacity-70">Sistema</div>
          <div className="text-lg font-semibold">Estado & Logs</div>
          <p className="text-sm opacity-70 mt-1">Monitorização e diagnósticos.</p>
        </Link>
      </div>
    </main>
  );
}
