// Server Component
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { CalendarDays, Users, UserCog, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

function roleLabel(role: Role | string | undefined) {
  switch (role) {
    case "ADMIN": return "Admin";
    case "TRAINER": return "Personal Trainer";
    case "CLIENT": return "Cliente";
    default: return "";
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const name = session?.user?.name || session?.user?.email || "Utilizador";
  const role = (session?.user as any)?.role as Role | undefined;

  // KPIs (seguro para qualquer role)
  const [clients, trainers, admins] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "TRAINER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  // Próximas sessões (até 7 dias), adaptadas ao role
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);

  const where: any = { scheduledAt: { gte: now, lte: in7 } };
  if (role === "TRAINER") where.trainerId = (session?.user as any)?.id;
  if (role === "CLIENT") where.clientId = (session?.user as any)?.id;

  const nextSessions = await prisma.session.findMany({
    where,
    include: {
      trainer: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 6,
  });

  return (
    <main className="p-6 space-y-6">
      {/* Saudação */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6">
        <h1 className="text-2xl font-semibold">
          Olá, {name}{role ? ` (${roleLabel(role)})` : ""}
        </h1>
        <p className="text-sm opacity-70 mt-1">
          Aqui tens um resumo do teu dia e atalhos rápidos.
        </p>
      </div>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Clientes" value={clients} icon={<Users className="h-5 w-5" />} />
        <KpiCard title="Treinadores" value={trainers} icon={<UserCog className="h-5 w-5" />} />
        <KpiCard title="Admins" value={admins} icon={<Shield className="h-5 w-5" />} />
      </section>

      {/* Mini Agenda */}
      <section className="rounded-2xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-5 w-5" />
          <h2 className="text-lg font-medium">Próximas sessões (7 dias)</h2>
        </div>

        {nextSessions.length === 0 ? (
          <div className="text-sm opacity-70">Sem sessões marcadas para este período.</div>
        ) : (
          <ul className="divide-y">
            {nextSessions.map(s => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">
                    {new Date(s.scheduledAt).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-70">
                    PT: {s.trainer?.name ?? "—"} · Cliente: {s.client?.name ?? "—"}
                  </div>
                </div>
                <a
                  href="/dashboard/sessions"
                  className="text-sm underline opacity-90 hover:opacity-100"
                >
                  Ver sessão
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-4 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">{title}</div>
        <div className="opacity-80">{icon}</div>
      </div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}
