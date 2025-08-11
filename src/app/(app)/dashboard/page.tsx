import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [clientes, pts, admins] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
  ]);

  return (
    <main className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_400px_at_0%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(800px_300px_at_100%_120%,rgba(168,85,247,0.25),transparent)] dark:opacity-70" />
        <div className="relative z-10 flex flex-col gap-2 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm opacity-70">
              Acompanhe os números e avance rapidamente com as ações mais usadas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/dashboard/trainer"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Criar sessão
            </a>
            <a
              href="/admin"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
            >
              Gestão (admin)
            </a>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CardStat label="Clientes" value={clientes} gradient="from-sky-500 to-cyan-500" />
        <CardStat label="Treinadores" value={pts} gradient="from-emerald-500 to-teal-500" />
        <CardStat label="Admins" value={admins} gradient="from-violet-500 to-fuchsia-500" />
      </section>
    </main>
  );
}

function CardStat({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border p-4">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-3 text-xs opacity-60">Atualizado em tempo real ao recarregar.</div>
    </div>
  );
}
