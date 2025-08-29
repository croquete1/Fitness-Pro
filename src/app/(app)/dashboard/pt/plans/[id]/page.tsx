// src/app/(app)/dashboard/pt/plans/[id]/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';
import { toStatus, statusLabel } from '@/lib/status';
import PlanViewBeacon from '@/components/PlanViewBeacon';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');
  if (![Role.ADMIN, Role.TRAINER, Role.CLIENT].includes(me.role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data: plan, error } = await sb.from('training_plans').select('*').eq('id', params.id).single();
  if (error || !plan) redirect('/dashboard/pt/plans');

  // RBAC simples
  if (me.role === Role.TRAINER && plan.trainer_id !== me.id) redirect('/dashboard/pt/plans');
  if (me.role === Role.CLIENT && plan.client_id !== me.id) redirect('/dashboard');
  if (me.role !== Role.ADMIN && me.role !== Role.TRAINER) redirect('/dashboard');

  const created = plan.created_at ? new Date(plan.created_at).toLocaleString() : '—';
  const viewed  = plan.viewed_at  ? new Date(plan.viewed_at).toLocaleString()  : '—';
  const status = toStatus(plan.status);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1>{plan.title ?? `Plano #${String(plan.id).slice(0, 6)}`}</h1>
      <PlanViewBeacon planId={String(plan.id)} />

      <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
        <div className="grid-2">
          <div>
            <div className="muted small">Estado</div>
            <div>
              <span className={`chip ${status === 'ACTIVE' ? 'chip-success' : status === 'PENDING' ? 'chip-warn' : 'chip-danger'}`}>
                {statusLabel(status)}
              </span>
            </div>
          </div>
          <div>
            <div className="muted small">Treinador</div>
            <div className="mono">{plan.trainer_id ?? '—'}</div>
          </div>
          <div>
            <div className="muted small">Criado</div>
            <div>Plano criado a {created}</div>
          </div>
          <div>
            <div className="muted small">Visualização</div>
            <div>{viewed === '—' ? 'Ainda não visualizado pelo cliente' : `Visualizado a ${viewed}`}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="muted">Conteúdo do plano</div>
          <div style={{ paddingTop: 6 }}>— (integração dos exercícios aqui)</div>
        </div>
      </div>
    </div>
  );
}
