import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SystemLogsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (role !== "ADMIN") redirect("/dashboard");

  // Ainda não há tabela de logs → mostra vazio
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Logs</h1>
      <div className="rounded-2xl border p-6 text-sm opacity-70">
        Sem logs para apresentar.
      </div>
    </main>
  );
}
