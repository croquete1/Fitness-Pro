// src/app/(app)/dashboard/trainer/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import SessionScheduler from "@/components/trainer/SessionScheduler";
import ClientListTable from "@/components/trainer/ClientListTable";
import WorkoutApprovalList from "@/components/trainer/WorkoutApprovalList";

export default function TrainerPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Área do PT</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="mb-3 text-lg font-medium">Criar / Agendar Sessão</h2>
          <SessionScheduler />
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="mb-3 text-lg font-medium">Clientes</h2>
          <ClientListTable />
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-medium">Aprovação de Treinos</h2>
        <WorkoutApprovalList />
      </div>
    </div>
  );
}
