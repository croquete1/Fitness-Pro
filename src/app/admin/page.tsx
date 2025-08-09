import { prisma } from "@/lib/db";
import KPI from "@/components/dashboard/KPI";
import { UsersLineChart, RolesBarChart } from "@/components/dashboard/Charts";
import AdminHeader from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic"; // render no pedido: evita timeouts no build

type SeriesPoint = { name: string; total: number };
type RolePoint = { role: string; count: number };

function fmtDate(d: Date) {
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

async function getData() {
  try {
    const [clientes, pts, admins, recentUsers] = await Promise.all([
      prisma.user.count({ where: { role: "cliente" } }),
      prisma.user.count({ where: { role: "pt" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
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

    return { total, clientes, pts, admins, series, roles, recentUsers };
  } catch {
    return {
      total: 0,
      clientes: 0,
      pts: 0,
      admins: 0,
      series: [] as SeriesPoint[],
      roles: [] as RolePoint[],
      recentUsers: [] as {
        id: string;
        email: string | null;
        name: string | null;
        role: "cliente" | "pt" | "admin";
        createdAt: Date;
      }[],
    };
  }
}

export default async function AdminPage() {
  const data = await getData();

  return (
    <div className="min-h-dvh flex flex-col">
      <AdminHeader />

      <main className="p-4 space-y-6">
        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI label="Total utilizadores" value={data.total} />
          <KPI label="Clientes" value={data.clientes} />
          <KPI label="Personais" value={data.pts} />
          <KPI label="Admins" value={data.admins} />
        </section>

        {/* Gráficos */}
        <section className="grid gap-4 lg:grid-cols-2">
          <UsersLineChart data={data.series} />
          <RolesBarChart data={data.roles} />
        </section>

        {/* Utilizadores recentes */}
        <section className="rounded-xl border">
          <div className="p-4 border-b">
            <h2 className="text-base font-semibold">Utilizadores recentes</h2>
            <p className="text-sm text-gray-500">Últimos registos na plataforma</p>
          </div>

          <div className="p-4 overflow-x-auto">
            {data.recentUsers.length === 0 ? (
              <div className="text-sm text-gray-500">Sem registos recentes.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr className="[&>th]:py-2 [&>th]:px-2">
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Papel</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.recentUsers.map((u) => (
                    <tr key={u.id} className="[&>td]:py-2 [&>td]:px-2">
                      <td>{u.name ?? "—"}</td>
                      <td className="text-gray-700">{u.email ?? "—"}</td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
                              : u.role === "pt"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="text-gray-500">{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
