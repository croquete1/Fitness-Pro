import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (role !== "ADMIN") redirect("/dashboard");

  const [totalUsers, totalSessions, sessionsByStatus] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.session.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Relatórios</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
          <div className="text-sm opacity-70">Utilizadores</div>
          <div className="text-3xl font-bold">{totalUsers}</div>
        </div>
        <div className="rounded-2xl border p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
          <div className="text-sm opacity-70">Sessões</div>
          <div className="text-3xl font-bold">{totalSessions}</div>
        </div>
        <div className="rounded-2xl border p-4 bg-gradient-to-br from-amber-500/10 to-rose-500/10">
          <div className="text-sm opacity-70">Estados distintos</div>
          <div className="text-3xl font-bold">{sessionsByStatus.length}</div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sessionsByStatus.map((r) => (
              <tr key={String(r.status)} className="border-t">
                <td className="px-4 py-2">{String(r.status)}</td>
                <td className="px-4 py-2">{r._count._all}</td>
              </tr>
            ))}
            {sessionsByStatus.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center opacity-60" colSpan={2}>
                  Sem dados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
