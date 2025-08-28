// src/app/(app)/dashboard/pt/plans/[id]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import PlanViewBeacon from '@/components/PlanViewBeacon';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type SBPlan = {
  id: string;
  title: string | null;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | null;
  trainer_id: string;
  client_id: string;
  notes: string | null;
  exercises: any[] | null;
  created_at: string | null;
  updated_at: string | null;
  viewed_at: string | null;
};

function canAccess(user: { id: string; role: Role }, plan: SBPlan) {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.TRAINER && plan.trainer_id === user.id) return true;
  if (user.role === Role.CLIENT && plan.client_id === user.id) return true;
  return false;
}

async function getPlan(id: string) {
  const sb = createServerClient();
  const { data, error } = await sb.from('training_plans').select('*').eq('id', id).maybeSingle();
  return error ? null : (data as SBPlan | null);
}

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');

  const plan = await getPlan(params.id);
  if (!plan) return <div style={{ padding: 16 }}><div className="card" style={{ padding: 12 }}>Plano não encontrado.</div></div>;
  if (!canAccess({ id: me.id, role: me.role }, plan)) redirect('/dashboard');

  const created = plan.created_at ? new Date(plan.created_at).toLocaleString() : '—';
  const updated = plan.updated_at ? new Date(plan.updated_at).toLocaleString() : '—';
  const viewed  = plan.viewed_at  ? new Date(plan.viewed_at ).toLocaleString() : '—';

  const statusChip =
    plan.status === 'ACTIVE' ? 'chip chip-success'
      : plan.status === 'SUSPENDED' ? 'chip chip-danger'
      : 'chip';

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>{plan.title || `Plano #${plan.id.slice(0,6)}`}</h1>

      {/* marca visualização quando CLIENT abre o plano */}
      <PlanViewBeacon planId={String(plan.id)} />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border p-4 bg-gradient-to-br from-indigo-50 to-white">
          <div className="text-sm text-gray-600">Estado</div>
          <div className="mt-1"><span className={statusChip}>{plan.status ?? '—'}</span></div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-600">Trainer</div>
              <div className="font-medium">{plan.trainer_id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Cliente</div>
              <div className="font-medium">{plan.client_id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Criado</div>
              <div className="font-medium">{created}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Atualizado</div>
              <div className="font-medium">{updated}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-600">Visualização</div>
              <div className="font-medium">
                {viewed === '—' ? 'Ainda não visualizado pelo cliente' : `Visualizado a ${viewed}`}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-4 bg-gradient-to-br from-emerald-50 to-white">
          <div className="text-sm text-gray-600">Notas do plano</div>
          <div className="mt-1 whitespace-pre-wrap">{plan.notes || '—'}</div>
        </div>
      </div>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-lg font-semibold">Exercícios</h3>
        </div>

        {!plan.exercises?.length ? (
          <div className="text-muted">Sem exercícios neste plano.</div>
        ) : (
          <div className="grid gap-3">
            {plan.exercises.map((ex: any, i: number) => (
              <div key={ex.id ?? i} className="rounded-xl border p-3 bg-slate-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">{ex.name || `Exercício ${i + 1}`}</div>
                  <div className="flex flex-wrap gap-2">
                    {ex.sets != null && <span className="chip">Séries: {ex.sets}</span>}
                    {ex.reps && <span className="chip">Reps: {ex.reps}</span>}
                    {ex.rest && <span className="chip">Descanso: {ex.rest}</span>}
                    {ex.weight && <span className="chip chip-info">Peso: {ex.weight}</span>}
                  </div>
                </div>
                {ex.notes && <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{ex.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
