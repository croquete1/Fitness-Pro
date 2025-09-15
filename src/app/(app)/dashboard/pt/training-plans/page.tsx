export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
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

export default async function PTTrainingPlansPage() {
  // Sessão "flat"
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN' && role !== 'PT') redirect('/dashboard');

  const sb = createServerClient();

  // Lista de planos (se PT, apenas os seus)
  const base = sb
    .from('training_plans')
    .select('id,title,status,client_id,trainer_id,updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  const { data, error } =
    role === 'ADMIN' ? await base : await base.eq('trainer_id', viewer.id);

  const plans: PlanRow[] = !error && data ? (data as PlanRow[]) : [];

  return (
    <main className="p-4 space-y-4">
      <PageHeader
        title="Planos de treino"
        subtitle={role === 'ADMIN' ? 'Todos os planos' : 'Os teus planos'}
        actions={
          <Link href="/dashboard/pt/plans/new" className="btn chip">
            + Novo plano
          </Link>
        }
      />

      {plans.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-muted">Sem planos para apresentar.</div>
          </CardContent>
        </Card>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          {plans.map((p) => (
            <Card key={p.id}>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold truncate">
                    {p.title ?? 'Sem título'}
                  </h3>
                  <Badge
                    variant={
                      p.status === 'ACTIVE'
                        ? 'success'
                        : p.status === 'DRAFT'
                        ? 'neutral'
                        : 'warning'
                    }
                  >
                    {p.status ?? '—'}
                  </Badge>
                </div>

                <div className="text-sm opacity-70">
                  Atualizado:{' '}
                  {p.updated_at
                    ? new Date(p.updated_at).toLocaleString('pt-PT')
                    : '—'}
                </div>

                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/dashboard/pt/plans/${p.id}`}
                    className="btn chip"
                  >
                    Ver
                  </Link>
                  <Link
                    href={`/dashboard/pt/plans/${p.id}/edit`}
                    className="btn chip"
                  >
                    Editar
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
