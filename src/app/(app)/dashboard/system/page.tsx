import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <main className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Sistema</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Base de dados</div>
          <div className="text-2xl font-bold">Online</div>
          <div className="text-xs opacity-60 mt-1">Healthy (mock)</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Fila de jobs</div>
          <div className="text-2xl font-bold">Vazia</div>
          <div className="text-xs opacity-60 mt-1">0 jobs pendentes (mock)</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Versão</div>
          <div className="text-2xl font-bold">v0.1.0</div>
          <div className="text-xs opacity-60 mt-1">Último deploy: agora (mock)</div>
        </div>
      </div>
    </main>
  );
}
