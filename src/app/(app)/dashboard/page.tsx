import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import MiniAgenda from "@/components/dashboard/MiniAgenda";
import { Users, Dumbbell, Shield, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name || session?.user?.email || "Utilizador";
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;

  const [clientes, pts, admins] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
  ]);

  const roleLabel =
    role === "ADMIN" ? "Admin" : role === "TRAINER" ? "Personal Trainer" : "";

  return (
    <main className="p-6 space-y-6">
      {/* Hero / Greeting */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-indigo-500/10 via-background to-transparent p-6">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-12 -right-10 h-44 w-44 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {name}
          {roleLabel ? (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
              {roleLabel}
            </span>
          ) : null}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bem-vindo à sua área — aqui tem um resumo rápido e a sua agenda.
        </p>
      </div>

      {/* KPIs coloridos */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Clientes"
          value={clientes}
          gradient="from-emerald-500/15 to-emerald-500/0"
        />
        <KpiCard
          icon={<Dumbbell className="h-5 w-5" />}
          label="Treinadores"
          value={pts}
          gradient="from-blue-500/15 to-blue-500/0"
        />
        <KpiCard
          icon={<Shield className="h-5 w-5" />}
          label="Admins"
          value={admins}
          gradient="from-amber-500/15 to-amber-500/0"
        />
      </div>

      {/* Linha com Mini Agenda + placeholder de atividade */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MiniAgenda />
        </div>
        <div className="rounded-2xl border p-4">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h3 className="text-sm font-semibold">Atividade recente</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            (Em breve) Logs de sistema e aprovações recentes…
          </p>
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2 text-sm opacity-80">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </div>
    </div>
  );
}
