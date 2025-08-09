import { prisma } from "@/lib/db";
import { UsersLineChart, RolesBarChart } from "@/components/dashboard/Charts";
import KPI from "@/components/dashboard/KPI";

export const dynamic = "force-dynamic"; // gera no pedido, evita timeouts de SSG

async function getData() {
  try {
    const [clientes, pts, admins] = await Promise.all([
      prisma.user.count({ where: { role: "cliente" } }),
      prisma.user.count({ where: { role: "pt" } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    const total = clientes + pts + admins;

    // Série fictícia (placeholder) – poderá trocar por dados reais (ex.: por semana)
    const series = [
      { name: "Jan", total: Math.max(0, total - 6) },
      { name: "Fev", total: Math.max(0, total - 4) },
      { name: "Mar", total: Math.max(0, total - 2) },
      { name: "Abr", total },
      { name: "Mai", total + 2 },
      { name: "Jun", total + 3 },
    ];

    const roles = [
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
    // Em caso de erro na BD, devolvemos defaults
    return {
      total: 0,
      clientes: 0,
      pts: 0,
      admins: 0,
      series: [],
      roles: [],
      activities: [],
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
