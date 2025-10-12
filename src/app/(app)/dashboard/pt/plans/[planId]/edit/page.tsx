// src/app/(app)/dashboard/pt/plans/[id]/page.tsx
export const dynamic = 'force-dynamic';

import type { Route } from 'next';
import { redirect, notFound } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isPT, isAdmin } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Card, { CardContent } from '@/components/ui/Card';

// ... (os teus types PlanRow, ProfileRow e a função formatDatePT ficam iguais)
type PlanRow = {
  id: string;
  title: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  client_id: string | null;
  trainer_id: string | null;
  updated_at?: string | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
};

function formatDatePT(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

export default async function PTPlanViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: planId } = await params;
  // Sessão
  const me = await getSessionUserSafe();

  // Verificação de segurança que também funciona como um "type guard" para o TypeScript
  if (!me || !me.user || !me.user.id) {
    redirect('/login' as Route);
  }

  // A partir daqui, o TypeScript sabe que `me` e `me.user` são objetos válidos
  const role = toAppRole(me.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard' as Route);

  const sb = createServerClient();
  const userId = me.user.id; // Totalmente seguro agora

  // 1) Plano
  const { data: planArr, error: planErr } = await sb
    .from('training_plans')
    .select('id,title,status,client_id,trainer_id,updated_at')
    .eq('id', planId)
    .limit(1)
    .returns<PlanRow[]>();

  const plan = planArr?.[0] ?? null;
  if (planErr || !plan) return notFound();

  // 2) Guard de ownership para PT
  if (isPT(role) && plan.trainer_id !== userId) {
    redirect('/dashboard/pt/plans' as Route);
  }

  // 3) Info rápida do cliente e do PT (para mostrar nomes)
  const [clientProf, trainerProf] = await Promise.all([
    plan.client_id
      ? sb
          .from('users')
          .select('id,name,email')
          .eq('id', plan.client_id)
          .limit(1)
          .returns<ProfileRow[]>()
          .then((r) => r.data?.[0] ?? null)
      : Promise.resolve(null),
    plan.trainer_id
      ? sb
          .from('users')
          .select('id,name,email')
          .eq('id', plan.trainer_id)
          .limit(1)
          .returns<ProfileRow[]>()
          .then((r) => r.data?.[0] ?? null)
      : Promise.resolve(null),
  ]);

  const status = (plan.status ?? 'DRAFT') as NonNullable<PlanRow['status']>;

  return (
    <main className="p-4 md:p-6 space-y-4">
      <PageHeader
        title={plan.title ?? 'Plano de treino'}
        subtitle={
          <>
            Plano #{String(plan.id).slice(0, 8)}{' '}
            <Badge
              variant={
                status === 'ACTIVE' ? 'success' : status === 'ARCHIVED' ? 'neutral' : 'warning'
              }
            >
              {status}
            </Badge>
          </>
        }
      />

      <Card>
        <CardContent className="space-y-3">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}
          >
            <div className="rounded-lg border p-3">
              <div className="text-xs opacity-70">Cliente</div>
              <div className="font-medium">
                {clientProf?.name ?? clientProf?.email ?? plan.client_id ?? '—'}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs opacity-70">Personal Trainer</div>
              <div className="font-medium">
                {trainerProf?.name ?? trainerProf?.email ?? plan.trainer_id ?? '—'}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs opacity-70">Última atualização</div>
              <div className="font-medium">{formatDatePT(plan.updated_at)}</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {isPT(role) && (
              <a className="btn chip" href={`/dashboard/pt/plans/${plan.id}/edit`}>
                ✏️ Editar plano
              </a>
            )}
            <a className="btn chip" href="/dashboard/pt/plans">
              ⟵ Voltar à lista
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}