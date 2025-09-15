// src/app/(app)/dashboard/pt/settings/locations/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';

type LocationRow = {
  id: string;
  trainer_id: string;
  label: string | null;
  address: string | null;
  city: string | null;
  created_at: string | null;
};

export default async function LocationsPage() {
  // Sessão “flat” (sem .user)
  const me = await getSessionUserSafe();
  if (!me?.id) redirect('/login' as Route);

  const role = (toAppRole(me.role) ?? 'CLIENT') as AppRole;
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();

  // Carregar os locais do treinador (ou todos, se ADMIN)
  let rows: LocationRow[] = [];
  try {
    const q = sb
      .from('pt_locations')
      .select('id, trainer_id, label, address, city, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    const { data, error } =
      role === 'ADMIN' ? await q : await q.eq('trainer_id', me.id);

    if (!error && data) rows = data as LocationRow[];
  } catch {
    rows = [];
  }

  return (
    <main className="p-4 grid gap-4">
      <PageHeader
        title="📍 Locais de atendimento"
        subtitle="Define os locais onde realizas sessões com os clientes."
        actions={
          // Mantive o botão para futura rota de criação.
          // Se já tiveres uma página /new, o link funciona de imediato.
          <a
            href="/dashboard/pt/settings/locations/new"
            className="btn chip"
          >
            + Adicionar local
          </a>
        }
      />

      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-sm opacity-70">
              Ainda não tens locais registados.
            </div>
          ) : (
            <ul className="grid gap-2">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">
                      {r.label ?? 'Sem título'}
                    </div>
                    <div className="text-sm opacity-70">
                      {r.address ?? '—'}
                      {r.city ? ` · ${r.city}` : ''}
                    </div>
                    {r.created_at && (
                      <div className="text-xs opacity-60 mt-1">
                        criado em {new Date(r.created_at).toLocaleString('pt-PT')}
                      </div>
                    )}
                  </div>

                  {/* Botões de ação (editar/apagar) — podes ligar às tuas rotas quando quiseres */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`/dashboard/pt/settings/locations/${r.id}/edit`}
                      className="text-xs rounded-md ring-1 ring-slate-300 px-2 py-1"
                    >
                      Editar
                    </a>
                    <form
                      action={`/dashboard/pt/settings/locations/${r.id}/delete`}
                      method="post"
                      onSubmit={(e) => {
                        if (!confirm('Eliminar este local?')) e.preventDefault();
                      }}
                    >
                      <button
                        className="text-xs rounded-md ring-1 ring-rose-300 text-rose-600 px-2 py-1"
                        type="submit"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
