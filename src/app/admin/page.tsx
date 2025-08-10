// src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { Role, Status } from "@prisma/client";
import PendingApprovals from "@/components/admin/PendingApprovals";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [clientes, pts, admins, pending] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { status: Status.PENDING } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Administração</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Clientes</div>
          <div className="text-3xl font-bold">{clientes}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Treinadores</div>
          <div className="text-3xl font-bold">{pts}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Admins</div>
          <div className="text-3xl font-bold">{admins}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm opacity-70">Pendentes</div>
          <div className="text-3xl font-bold">{pending}</div>
        </div>
      </div>

      {/* Aprovações Pendentes (client component) */}
      <PendingApprovals />

      {/* Utilizadores recentes */}
      <div className="rounded-xl border p-4">
        <h3 className="text-lg font-semibold mb-3">Novos utilizadores</h3>
        {recentUsers.length === 0 ? (
          <p className="text-sm opacity-70">Sem registos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr className="border-b">
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Criado</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{u.name ?? "-"}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
