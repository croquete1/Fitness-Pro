import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import MiniAgenda from "@/components/dashboard/MiniAgenda";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  const displayName = (session?.user as any)?.name || (session?.user as any)?.email || "Utilizador";

  const [clientes, pts, admins] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
  ]);

  const greet =
    role === "ADMIN"
      ? `Olá, ${displayName} (ADMIN)`
      : role === "TRAINER"
      ? `Olá, ${displayName} (Personal Trainer)`
      : `Olá, ${displayName}`;

  return (
    <main className="space-y-8">
      {/* saudação */}
      <div className="rounded-2xl border p-5 bg-glass-gradient dark:bg-glass-gradient-dark shadow-glow-soft">
        <h1 className="text-xl font-semibold">{greet}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bem-vindo à tua área — aqui tens um resumo e as próximas sessões.
        </p>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassCard title="Clientes" value={clientes} hint="+ últimos 30 dias" />
        <GlassCard title="Treinadores" value={pts} hint="equipa ativa" />
        <GlassCard title="Admins" value={admins} hint="supervisores" />
      </section>

      {/* Mini agenda com filtro e quick actions */}
      <MiniAgenda role={role} />
    </main>
  );
}

function GlassCard({ title, value, hint }: { title: string; value: number; hint?: string }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border p-5 shadow-glow-soft 
                 bg-glass-gradient dark:bg-glass-gradient-dark"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute inset-0 -translate-x-1/2 w-1/2 bg-white/10 blur-3xl" />
      </div>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
          <div className="mt-2 text-3xl font-semibold">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl border flex items-center justify-center bg-background/70">
          <span className="text-sm opacity-70">★</span>
        </div>
      </div>
      {hint && <div className="mt-3 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
