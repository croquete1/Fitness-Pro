// src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [clientes, pts, admins, recentUsers] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card label="Clientes" value={clientes} />
        <Card label="Treinadores" value={pts} />
        <Card label="Admins" value={admins} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium">Utilizadores recentes</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Criação</Th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-t">
                  <Td>{u.name ?? "—"}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.role}</Td>
                  <Td>{new Date(u.createdAt).toLocaleString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}
