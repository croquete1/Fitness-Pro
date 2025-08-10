import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [clientes, pts, admins] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
  ]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      </div>
    </main>
  );
}
