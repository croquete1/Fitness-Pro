import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Utilizadores</h1>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Criado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.name ?? "-"}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">{u.status}</td>
                <td className="px-4 py-2">
                  {u.createdAt.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center opacity-60" colSpan={5}>
                  Sem utilizadores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
