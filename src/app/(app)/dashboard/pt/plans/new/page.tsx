import { createServerClient } from '@/lib/supabaseServer';

export default async function NewPlanPage() {
  const sb = createServerClient();

  // tenta obter lista de clientes (ajusta o nome da tabela/colunas ao teu schema)
  const { data: clients, error } = await sb
    .from('profiles') // ex.: profiles com role 'client'
    .select('id, full_name')
    .eq('role', 'client')
    .order('full_name', { ascending: true });

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 text-rose-700 bg-rose-50 p-4">
        Erro a carregar clientes: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Criar plano</h1>

      <form method="post" action="/api/pt/plans" className="space-y-4">
        <div className="grid gap-3">
          <label className="text-sm font-medium">Cliente</label>
          <select
            name="clientId"
            required
            className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>Selecionar…</option>
            {clients?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.full_name ?? c.id}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium">Título do plano</label>
          <input
            name="title"
            required
            placeholder="Ex.: Hipertrofia — 8 semanas"
            className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
        >
          Criar plano
        </button>
      </form>
    </div>
  );
}
