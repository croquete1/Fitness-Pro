export const dynamic = "force-dynamic";

export default function ApprovalsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Aprovações de Conta</h1>
      <div className="rounded-2xl border bg-white/70 dark:bg-zinc-900/50 backdrop-blur p-5">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Lista em tempo real de contas pendentes (carregada via API). 
        </p>
      </div>
    </div>
  );
}
