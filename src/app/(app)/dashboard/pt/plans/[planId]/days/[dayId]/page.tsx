// src/app/(app)/dashboard/pt/plans/[planId]/days/[dayId]/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Params = { planId: string; dayId: string };

export default async function PlanDayPage({ params }: { params: Promise<Params> }) {
  const { planId, dayId } = await params;
  const sb = createServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  const { data: day } = await sb
    .from('training_plan_days' as any)
    .select('id, name, notes, order_index')
    .eq('id', dayId)
    .single();

  if (!day) {
    return (
      <div className="trainer-plan-day">
        <header className="neo-panel neo-panel--header trainer-plan-day__header">
          <div>
            <h1 className="trainer-plan-day__title">Dia de plano</h1>
            <p className="trainer-plan-day__subtitle">Dia não encontrado.</p>
          </div>
        </header>
        <section className="neo-panel">
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              📅
            </span>
            <p className="neo-empty__title">Dia não encontrado</p>
            <p className="neo-empty__description">Verifica se o dia ainda existe neste plano.</p>
            <Link className="btn" data-variant="secondary" data-size="sm" href={`/dashboard/pt/plans/${planId}`}>
              Voltar ao plano
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="trainer-plan-day">
      <header className="neo-panel neo-panel--header trainer-plan-day__header">
        <div>
          <h1 className="trainer-plan-day__title">{`Dia ${day.order_index ?? ''}${day.name ? ` — ${day.name}` : ''}`}</h1>
          <p className="trainer-plan-day__subtitle">{day.notes || 'Resumo e acesso rápido aos blocos de treino.'}</p>
        </div>
        <span className="neo-tag" data-tone="neutral">Plano do PT</span>
      </header>

      <section className="neo-panel trainer-plan-day__actions">
        <div className="trainer-plan-day__buttons">
          <Link
            className="btn"
            data-variant="primary"
            data-size="sm"
            href={`/dashboard/pt/plans/${planId}/days/${dayId}/blocks`}
          >
            🏋️ Ver blocos
          </Link>
          <Link className="btn" data-variant="ghost" data-size="sm" href={`/dashboard/pt/plans/${planId}`}>
            ← Voltar ao plano
          </Link>
        </div>
      </section>
    </div>
  );
}
