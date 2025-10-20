// src/app/(app)/dashboard/pt/plans/[planId]/days/[dayId]/blocks/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Params = { planId: string; dayId: string };

export default async function PlanDayBlocksPage({ params }: { params: Promise<Params> }) {
  const { planId, dayId } = await params;
  const sb = createServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  const { data: blocks } = await sb
    .from('training_plan_blocks' as any)
    .select('id, title, notes, order_index')
    .eq('day_id', dayId)
    .order('order_index', { ascending: true });

  const orderedBlocks = (blocks ?? []).map((block: any, index: number) => ({
    ...block,
    position: block.order_index ?? index + 1,
  }));

  return (
    <div className="trainer-plan-blocks">
      <header className="neo-panel neo-panel--header trainer-plan-blocks__header">
        <div>
          <h1 className="trainer-plan-blocks__title">Blocos do dia</h1>
          <p className="trainer-plan-blocks__subtitle">
            Consulta e edita rapidamente os blocos deste plano.
          </p>
        </div>
        <span className="neo-tag" data-tone="neutral">{orderedBlocks.length} bloco(s)</span>
      </header>

      <section className="neo-panel trainer-plan-blocks__actions">
        <div className="trainer-plan-blocks__buttons">
          <Link
            className="btn"
            data-variant="primary"
            data-size="sm"
            href={`/dashboard/pt/plans/${planId}/days/${dayId}/blocks/order`}
          >
            ↕️ Ordenar blocos
          </Link>
          <Link className="btn" data-variant="ghost" data-size="sm" href={`/dashboard/pt/plans/${planId}`}>
            ← Voltar ao plano
          </Link>
        </div>
      </section>

      <section className="trainer-plan-blocks__list">
        {orderedBlocks.length === 0 ? (
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              📦
            </span>
            <p className="neo-empty__title">Sem blocos configurados</p>
            <p className="neo-empty__description">Adiciona blocos para estruturar exercícios, tempos e notas.</p>
          </div>
        ) : (
          <ul className="trainer-plan-blocks__grid">
            {orderedBlocks.map((block) => (
              <li key={block.id} className="neo-surface trainer-plan-blocks__item">
                <div>
                  <h3>
                    #{block.position} — {block.title || 'Bloco'}
                  </h3>
                  {block.notes && <p className="neo-text--sm text-muted">{block.notes}</p>}
                </div>
                <Link
                  href={`/dashboard/pt/plans/${planId}/days/${dayId}/blocks/${block.id}`}
                  className="btn"
                  data-variant="secondary"
                  data-size="sm"
                >
                  ✏️ Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
