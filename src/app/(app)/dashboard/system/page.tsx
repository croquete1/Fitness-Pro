// Sistema — apenas ADMIN
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (role !== "ADMIN") redirect("/dashboard");

  const [totalUsers, admins, trainers, clients, totalSessions] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "TRAINER" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.session.count(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Sistema</h1>
        <p className="text-sm opacity-70">
          Estado geral e métricas rápidas do sistema.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Utilizadores" value={totalUsers} />
        <Card label="Admins" value={admins} />
        <Card label="PTs" value={trainers} />
        <Card label="Clientes" value={clients} />
        <Card label="Sessões" value={totalSessions} />
      </div>

      <div className="rounded-xl border p-4 bg-white/60 dark:bg-black/20 backdrop-blur">
        <div className="text-sm opacity-70">Ambiente</div>
        <div className="mt-1 text-sm">
          <strong>NODE_ENV:</strong> {process.env.NODE_ENV ?? "desconhecido"}
        </div>
        <div className="text-sm">
          <strong>Database:</strong> Postgres (via Prisma)
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 bg-white/60 dark:bg-black/20 backdrop-blur">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
