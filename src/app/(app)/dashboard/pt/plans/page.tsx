// src/app/(app)/dashboard/pt/plans/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isPT, isAdmin, type AppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

type PlanRow = {
  id: string;
  title: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  client_id: string | null;
  trainer_id: string | null;
  updated_at: string | null;
};

export default async function PTPlansPage() {
  // 1) Sessão
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.id) redirect('/login');

  const role = (toAppRole(sessionUser.role) ?? 'CLIENT') as AppRole;
  // ❌ NADA de 'TRAINER' aqui — só PT/Admin
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  // 2) Dados
  const sb = createServerClient();
  let plans: PlanRow[] = [];

  try {
    let q = sb
      .from('training_plans')
      .select('id,title,status,client_id,trainer_id,updated_at')
      .order('updated_at', { ascending: false })
      .limit(200);

    if (isPT(role)) {
      q = q.eq('trainer_id', String(sessionUser.id));
    }

    const { data, error } = await q;
    if (!error && data) plans = data as PlanRow[];
  } catch {
    plans = [];
  }

  // 3) UI
  return (
    <main className="p-4 md:p-6 space-y-4">
      <PageHeader
        title="📝 Planos de treino"
        subtitle={isAdmin(role) ? 'Admin · todos os planos' : 'Os teus planos (PT)'}
        actions={<a href="/dashboard/pt/plans/new" className="btn chip">+ Criar plano</a>}
      />

      <Card>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-sm opacity-70">Ainda não tens planos.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full border-separate border-spacing-0">
                <thead className="[&_th]:text-left">
                  <tr>
                    <th className="py-2 pr-3">Título</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Atualizado</th>
                    <th className="py-2 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => {
                    const status = p.status ?? 'DRAFT';
                    const variant =
                      status === 'ACTIVE' ? 'success' : status === 'ARCHIVED' ? 'neutral' : 'warning';

                    return (
                      <tr key={p.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                        <td className="py-2 pr-3 font-medium">{p.title ?? 'Sem título'}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={variant as any}>{status}</Badge>
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs">{p.client_id ?? '—'}</td>
                        <td className="py-2 pr-3 text-sm opacity-80">
                          {p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '—'}
                        </td>
                        <td className="py-2 pr-3">
                          <a href={`/dashboard/pt/plans/${p.id}/edit`} className="btn chip">Editar</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}