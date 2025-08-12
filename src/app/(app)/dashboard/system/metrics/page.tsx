import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SystemMetricsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (role !== "ADMIN") redirect("/dashboard");

  const [users, sessions] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
  ]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Métricas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 bg-gradient-to-br from-sky-500/10 to-indigo-500/10">
          <div className="text-sm opacity-70">Utilizadores</div>
          <div className="text-3xl font-bold">{users}</div>
        </div>
        <div className="rounded-2xl border p-4 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
          <div className="text-sm opacity-70">Sessões</div>
          <div className="text-3xl font-bold">{sessions}</div>
        </div>
      </div>
    </main>
  );
}
