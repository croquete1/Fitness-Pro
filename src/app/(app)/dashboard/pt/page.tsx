// src/app/(app)/dashboard/pt/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PTClientesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { id: string; role?: "ADMIN" | "TRAINER" | "CLIENT" }
    | undefined;

  // Só ADMIN e TRAINER podem aceder
  if (!user?.role || (user.role !== "ADMIN" && user.role !== "TRAINER")) {
    redirect("/dashboard");
  }

  const clientes = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">PT / Clientes</h1>
          <p className="text-sm opacity-70">
            Lista de clientes (visível a Admin e Personal Trainer).
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white/60 p-0 dark:bg-neutral-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left bg-neutral-50/60 dark:bg-neutral-900/40">
            <tr className="[&>th]:px-3 [&>th]:py-2 border-b">
              <th>Nome</th>
              <th>Email</th>
              <th>Registo</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={3}>
                  Sem clientes.
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id} className="[&>td]:px-3 [&>td]:py-2 border-t">
                  <td>{c.name || "—"}</td>
                  <td>{c.email}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
