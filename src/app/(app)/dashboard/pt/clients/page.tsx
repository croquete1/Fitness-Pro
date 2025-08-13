// PT · Clientes — visível para TRAINER e ADMIN
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PtClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (!(role === "ADMIN" || role === "TRAINER")) {
    redirect("/dashboard"); // clientes não podem ver esta página
  }

  // Por agora: lista de todos os CLIENTES.
  // (Quando ativarmos a atribuição PT↔Cliente, filtramos por “trainerId”.)
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">PT · Clientes</h1>
        <p className="text-sm opacity-70">
          Lista de clientes. Em breve: atribuição direta PT ↔ Cliente.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white/60 dark:bg-black/20 backdrop-blur">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center opacity-70" colSpan={3}>
                  Sem clientes registados.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3">{c.name ?? "—"}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
