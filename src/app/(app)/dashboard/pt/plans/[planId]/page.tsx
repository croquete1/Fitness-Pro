// src/app/(app)/dashboard/pt/plans/[planId]/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Params = { planId: string };

export default async function PlanPage({ params }: { params: Promise<Params> }) {
  const { planId } = await params;
  const sb = createServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  // Plano
  const { data: plan } = await sb
    .from('training_plans' as any)
    .select('id, title, description, updated_at')
    .eq('id', planId)
    .single();

  if (!plan) {
    return (
      <div className="trainer-plan-view">
        <header className="neo-panel neo-panel--header trainer-plan-view__header">
          <div>
            <h1 className="trainer-plan-view__title">Plano</h1>
            <p className="trainer-plan-view__subtitle">Plano não encontrado.</p>
          </div>
        </header>
        <section className="neo-panel">
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              🗂️
            </span>
            <p className="neo-empty__title">Plano não encontrado</p>
            <p className="neo-empty__description">Confirma se o identificador ainda está activo.</p>
            <Link className="btn" data-variant="secondary" data-size="sm" href="/dashboard/pt/plans">
              Voltar aos planos
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { data: days } = await sb
    .from('training_plan_days' as any)
    .select('id, name, notes, order_index, updated_at')
    .eq('plan_id', planId)
    .order('order_index', { ascending: true });

  const orderedDays = (days ?? []).map((day: any, index: number) => ({
    ...day,
    position: index + 1,
  }));

  return (
    <div className="trainer-plan-view">
      <header className="neo-panel neo-panel--header trainer-plan-view__header">
        <div>
          <h1 className="trainer-plan-view__title">{plan.title || 'Plano sem nome'}</h1>
          <p className="trainer-plan-view__subtitle">
            {plan.description || 'Sequência estruturada de dias de treino.'}
          </p>
        </div>
        <span className="neo-tag" data-tone="primary">Plano do PT</span>
      </header>

      <section className="neo-panel trainer-plan-view__actions">
        <div className="trainer-plan-view__buttons">
          <Link
            className="btn"
            data-variant="primary"
            data-size="sm"
            href={`/dashboard/pt/plans/${planId}/days/${encodeURIComponent('new')}`}
          >
            ➕ Criar dia
          </Link>
          <Link className="btn" data-variant="ghost" data-size="sm" href="/dashboard/pt/plans">
            ← Voltar aos planos
          </Link>
        </div>
        <p className="neo-text--sm text-muted">
          Última actualização: {plan.updated_at ? new Date(plan.updated_at).toLocaleString('pt-PT') : '—'}
        </p>
      </section>

      <section className="trainer-plan-view__list">
        {orderedDays.length === 0 ? (
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              📅
            </span>
            <p className="neo-empty__title">Ainda sem dias configurados</p>
            <p className="neo-empty__description">
              Cria o primeiro dia para começar a estruturar o plano de treino.
            </p>
          </div>
        ) : (
          <ul className="trainer-plan-view__grid">
            {orderedDays.map((day) => (
              <li key={day.id} className="neo-surface trainer-plan-view__item">
                <header>
                  <div>
                    <h3>
                      Dia {day.position}
                      {day.name ? ` — ${day.name}` : ''}
                    </h3>
                    {day.notes && <p className="neo-text--sm text-muted">{day.notes}</p>}
                  </div>
                  <span className="neo-tag" data-tone="neutral">
                    {day.updated_at
                      ? `Actualizado ${new Date(day.updated_at).toLocaleDateString('pt-PT')}`
                      : 'Sem data'}
                  </span>
                </header>
                <div className="trainer-plan-view__links">
                  <Link
                    href={`/dashboard/pt/plans/${planId}/days/${day.id}/blocks`}
                    className="btn"
                    data-variant="secondary"
                    data-size="sm"
                  >
                    🏋️ Exercícios e blocos
                  </Link>
                  <Link
                    href={`/dashboard/pt/plans/${planId}/days/${day.id}/blocks/order`}
                    className="btn"
                    data-variant="ghost"
                    data-size="sm"
                  >
                    ↕️ Ordenar blocos
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
