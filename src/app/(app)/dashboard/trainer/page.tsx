import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

import SessionScheduler from "@/components/trainer/SessionScheduler";
import ClientListTable from "@/components/trainer/ClientListTable";
import WorkoutApprovalList from "@/components/trainer/WorkoutApprovalList";

export const dynamic = "force-dynamic";

export default async function TrainerPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/trainer");

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (!(role === "ADMIN" || role === "TRAINER")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4 bg-card/50 backdrop-blur">
          <h2 className="mb-2 text-lg font-semibold">Agendar sessão</h2>
          <SessionScheduler />
        </div>

        <div className="rounded-2xl border p-4 bg-card/50 backdrop-blur">
          <h2 className="mb-2 text-lg font-semibold">Clientes</h2>
          <ClientListTable />
        </div>
      </div>

      <div className="rounded-2xl border p-4 bg-card/50 backdrop-blur">
        <h2 className="mb-2 text-lg font-semibold">Pedidos / Aprovações</h2>
        <WorkoutApprovalList />
      </div>
    </div>
  );
}
