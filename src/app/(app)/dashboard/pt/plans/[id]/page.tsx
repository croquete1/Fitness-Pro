// src/app/(app)/dashboard/pt/plans/[id]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import Link from 'next/link';
import PlanViewBeacon from '@/components/PlanViewBeacon';
import ToastHost from '@/components/ui/ToastHost';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';

type Exercise = {
  id?: string;
  name?: string;
  sets?: number;
  reps?: string | number;
  weight?: string | number;
  tempo?: string;
  rest?: string;
  notes?: string;
};

async function getPlanViaSupabase(id: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('training_plans')
    .select(
      'id,title,notes,exercises,status,created_at,updated_at,trainer_id,client_id'
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id as string,
    title: (data.title as string) ?? null,
    notes: (data.notes as string | null) ?? null,
    exercises: (data.exercises as any) ?? [],
    status: (data.status as string) ?? 'ACTIVE',
    createdAt: data.created_at ? String(data.created_at) : null,
    updatedAt: data.updated_at ? String(data.updated_at) : null,
    trainerId: (data.trainer_id as string) ?? null,
    clientId: (data.client_id as string) ?? null,
  };
}

function canAccess(
  user: { id: string; role: Role },
  plan: { trainerId: string | null; clientId: string | null }
) {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.TRAINER && plan.trainerId === user.id) return true;
  if (user.role === Role.CLIENT && plan.clientId === user.id) return true;
  return false;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');

  const plan = await getPlanViaSupabase(params.id);

  if (!plan || !canAccess({ id: me.id, role: me.role }, plan)) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Plano</h1>
        <div className="card" style={{ padding: 12 }}>
          <div className="badge-danger">Plano não encontrado ou sem permissões.</div>
        </div>
      </div>
    );
  }

  // Toasts por query (?saved=1 & ?error=...)
  const saved = searchParams?.saved === '1';
  const errorMsg =
    typeof searchParams?.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : '';

  const created = plan.createdAt ? new Date(plan.createdAt).toLocaleString() : '—';
  const updated = plan.updatedAt ? new Date(plan.updatedAt).toLocaleString() : '—';
  const exercises: Exercise[] = Array.isArray(plan.exercises)
    ? (plan.exercises as Exercise[])
    : [];

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <ToastHost
        success={saved ? 'Alterações guardadas com sucesso.' : undefined}
        error={errorMsg || undefined}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>{plan.title ?? `Plano #${plan.id}`}</h1>

        {(me.role === Role.ADMIN || me.role === Role.TRAINER) && (
          <Link className="btn chip" href={`/dashboard/pt/plans/${plan.id}/edit`}>
            Editar plano
          </Link>
        )}
      </div>

      {/* Marca visualização quando CLIENT abre o plano */}
      {me.role === Role.CLIENT && <PlanViewBeacon planId={String(plan.id)} />}

      <div className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
          }}
        >
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Estado
            </div>
            <div>
              <span
                className={
                  'badge ' +
                  (plan.status === 'ACTIVE'
                    ? 'badge-success'
                    : plan.status === 'SUSPENDED' || plan.status === 'DELETED'
                    ? 'badge-danger'
                    : '')
                }
              >
                {plan.status ?? '—'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Treinador
            </div>
            <div>{plan.trainerId ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Criado
            </div>
            <div>{created}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Última atualização
            </div>
            <div>{updated}</div>
          </div>
        </div>

        {/* Notas do plano */}
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted" style={{ marginBottom: 6 }}>
            Notas do plano
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{plan.notes || '—'}</div>
        </div>

        {/* Exercícios */}
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted" style={{ marginBottom: 10 }}>
            Exercícios
          </div>

          {exercises.length === 0 ? (
            <div
              className="muted"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 0',
              }}
            >
              <span style={{ fontSize: 18 }}>🗒️</span>
              Ainda não existem exercícios neste plano.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                className="table"
                style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Exercício</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Séries</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Reps</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Peso</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Tempo</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Descanso</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((ex, i) => (
                    <tr key={ex.id ?? i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>{ex.name || '—'}</td>
                      <td style={{ padding: 8 }}>{ex.sets ?? '—'}</td>
                      <td style={{ padding: 8 }}>{ex.reps ?? '—'}</td>
                      <td style={{ padding: 8 }}>{ex.weight ? `${ex.weight} kg` : '—'}</td>
                      <td style={{ padding: 8 }}>{ex.tempo ?? '—'}</td>
                      <td style={{ padding: 8 }}>{ex.rest ?? '—'}</td>
                      <td style={{ padding: 8, whiteSpace: 'pre-wrap' }}>{ex.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
