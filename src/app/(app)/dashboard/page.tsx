import { prisma } from "@/lib/db";
import { UsersLineChart, RolesBarChart } from "@/components/dashboard/Charts";
import KPI from "@/components/dashboard/KPI";

export const dynamic = "force-dynamic"; // render no pedido: evita timeouts no build

type SeriesPoint = { name: string; total: number };
type RolePoint = { role: string; count: number };

async function getData() {
  try {
    const [clientes, pts, admins] = await Promise.all([
      prisma.user.count({ where: { role: "cliente" } }),
      prisma.user.count({ where: { role: "pt" } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    const total = clientes + pts + admins;

    const series: SeriesPoint[] = [
      { name: "Jan", total: Math.max(0, total - 6) },
      { name: "Fev", total: Math.max(0, total - 4) },
      { name: "Mar", total: Math.max(0, total - 2) },
      { name: "Abr", total },
      { name: "Mai", total: total + 2 },
      { name: "Jun", total: total + 3 },
    ];

    const roles: RolePoint[] = [
      { role: "Clientes", count: clientes },
      { role: "PTs", count: pts },
      { role: "Admins", count: admins },
    ];

    const activities = [
      { id: "a1", label: "Novo registo (cliente)", date: "há 2h" },
      { id: "a2", label: "Sessão aprovada (PT João)", date: "há 5h" },
      { id: "a3", label: "Pagamento confirmado", date: "ontem" },
    ];

    return { total, clientes, pts, admins, series, roles, activities };
  } catch {
    return {
      total: 0,
      clientes: 0,
      pts: 0,
      admins: 0,
      series: [] as SeriesPoint[],
      roles: [] as RolePoint[],
      activities: [] as { id: string; label: string; date: string }[],
    };
  }
}

export default async function DashboardPage() {
  const data = await getData();

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Total utilizadores" value={data.total} />
        <KPI label="Clientes" value={data.clientes} />
        <KPI label="Personais" value={data.pts} />
        <KPI label="Admins" value={data.admins} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <UsersLineChart data={data.series} />
        <RolesBarChart data={data.roles} />
      </section>

      <section className="rounded-xl border p-4">
        <div className="text-sm text-gray-500 mb-3">Atividades recentes</div>
        {data.activities.length === 0 ? (
          <div className="text-sm text-gray-500">Sem atividades ainda.</div>
        ) : (
          <ul className="space-y-2">
            {data.activities.map((a) => (
              <li key={a.id} className="text-sm flex items-center justify-between">
                <span>{a.label}</span>
                <span className="text-gray-500">{a.date}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
