// src/app/(app)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import SessionScheduler from "@/components/trainer/SessionScheduler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id as string | undefined;
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;

  const [clientes, trainers, admins] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
  ]);

  // Agenda (próximas 6)
  const agendaWhere =
    role === "ADMIN"
      ? { scheduledAt: { gte: new Date() } }
      : role === "TRAINER"
      ? { trainerId: meId, scheduledAt: { gte: new Date() } }
      : meId
      ? { clientId: meId, scheduledAt: { gte: new Date() } }
      : { scheduledAt: { gte: new Date() } };

  const upcoming = await prisma.session.findMany({
    where: agendaWhere,
    include: {
      trainer: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 6,
  });

  return (
    <main className="p-6 space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-black">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl opacity-30 bg-indigo-400/40" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl opacity-30 bg-blue-400/40" />
        <div className="relative p-7 md:p-10">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Olá! 👋 Bem-vindo ao painel
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Visão geral rápida e agendamento em segundos.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <CardStat label="Clientes" value={clientes} />
            <CardStat label="Treinadores" value={trainers} />
            <CardStat label="Admins" value={admins} />
          </div>
        </div>
      </section>

      {/* Linha: Quick Scheduler + Agenda */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <h2 className="text-lg font-medium mb-3">Agendar sessão</h2>
          <SessionScheduler variant="compact" />
        </div>

        <div className="rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Agenda (próximas)</h2>
            {(role === "ADMIN" || role === "TRAINER") && (
              <Link href="/dashboard/sessions" className="text-sm underline underline-offset-4">
                Ver todas
              </Link>
            )}
          </div>
          <ul className="space-y-3">
            {upcoming.length === 0 && (
              <li className="text-sm text-muted-foreground">Sem sessões futuras.</li>
            )}
            {upcoming.map((s) => (
              <li key={s.id} className="rounded-lg border p-3">
                <div className="text-sm font-medium">
                  {new Date(s.scheduledAt).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Treinador: {s.trainer.name ?? s.trainer.email} · Cliente:{" "}
                  {s.client.name ?? s.client.email}
                </div>
                {s.notes && <div className="text-xs mt-1">{s.notes}</div>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function CardStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white/60 dark:bg-zinc-900/60 backdrop-blur p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
