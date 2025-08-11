// src/app/(app)/trainer/page.tsx
import TrainerClient from "./trainer/TrainerClient";

export const dynamic = "force-dynamic";

export default function TrainerPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Gestão de Sessões</h1>
        <p className="text-sm opacity-70">Cria, edita e remove sessões. (ADMIN tem todas as permissões do PT)</p>
      </div>
      <TrainerClient />
    </div>
  );
}
