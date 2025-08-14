// Dashboard › Administração — apenas ADMIN
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (role !== "ADMIN") redirect("/dashboard");

  // Métricas rápidas
  const [pending, totalUsers, trainers, clients, totalSessions] =
    await Promise.all([
      prisma.user.count({ where: { status: Status.PENDING } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.session.count(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Administração</h1>
        <p className="text-sm opacity-70">
          Área de gestão — utilizadores, aprovações e sistema.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Pendentes" value={pending} />
        <Kpi label="Utilizadores" value={totalUsers} />
        <Kpi label="PTs" value={trainers} />
        <Kpi label="Clientes" value={clients} />
        <Kpi label="Sessões" value={totalSessions} />
      </div>

      {/* Atalhos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NavCard
          title="Aprovações de conta"
          desc="Aprovar / rejeitar novas contas."
          href="/dashboard/admin/approvals"
        />
        <NavCard
          title="PT · Clientes"
          desc="Atribuições e gestão de clientes."
          href="/dashboard/pt/clients"
        />
        <NavCard
          title="Sistema"
          desc="Métricas e estado do sistema."
          href="/dashboard/system"
        />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 bg-white/60 dark:bg-black/20 backdrop-blur">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function NavCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl border p-4 hover:shadow-sm transition"
    >
      <div className="font-medium">{title}</div>
      <div className="text-sm opacity-70">{desc}</div>
    </a>
  );
}
