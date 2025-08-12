import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Faturação</h1>
      <div className="rounded-2xl border p-6 text-sm opacity-70">
        Sem dados de faturação.
      </div>
    </main>
  );
}
