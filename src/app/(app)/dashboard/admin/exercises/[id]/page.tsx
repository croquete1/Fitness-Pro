import * as React from 'react';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

import AdminExerciseFormClient from '../AdminExerciseFormClient';
import { createServerClient } from '@/lib/supabaseServer';
import { loadAdminExercisesDashboard } from '@/lib/admin/exercises/server';
import { normalizeDifficulty } from '@/lib/exercises/schema';

export const dynamic = 'force-dynamic';

const detailFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatTimestamp(iso: string | null) {
  if (!iso) return '—';
  try {
    return detailFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

type ExercisePageRow = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  description: string | null;
  video_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_published: boolean | null;
  is_global: boolean | null;
};

function mapRow(row: ExercisePageRow) {
  return {
    initial: {
      id: String(row.id),
      name: row.name ?? '',
      muscle_group: row.muscle_group ?? undefined,
      equipment: row.equipment ?? undefined,
      difficulty: normalizeDifficulty(row.difficulty) ?? undefined,
      description: row.description ?? undefined,
      video_url: row.video_url ?? undefined,
    },
    meta: {
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? row.created_at,
      isPublished: Boolean(row.is_published),
      isGlobal: Boolean(row.is_global),
    },
  } as const;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServerClient();
  const { data, error } = await sb
    .from('exercises')
    .select('id,name,muscle_group,equipment,difficulty,description,video_url,created_at,updated_at,is_published,is_global')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return notFound();

  const { initial, meta } = mapRow(data as ExercisePageRow);
  const dashboard = await loadAdminExercisesDashboard({ range: '90d', pageSize: 12 });
  const hero = dashboard.ok ? dashboard.data.hero : [];

  return (
    <div className="admin-exercise-form-page">
      <header className="admin-exercise-form-page__header">
        <div>
          <h1>✏️ Editar exercício</h1>
          <p>
            Mantém a informação alinhada entre equipas. As alterações ficam disponíveis nas dashboards admin, PT e cliente em
            tempo real.
          </p>
        </div>
        <dl className="admin-exercise-form-page__meta" aria-label="Resumo do exercício">
          <div>
            <dt>Estado</dt>
            <dd>{meta.isPublished ? 'Publicado' : 'Rascunho'}</dd>
          </div>
          <div>
            <dt>Disponibilidade</dt>
            <dd>{meta.isGlobal ? 'Catálogo global' : 'Biblioteca privada'}</dd>
          </div>
          <div>
            <dt>Criado em</dt>
            <dd>{formatTimestamp(meta.createdAt)}</dd>
          </div>
          <div>
            <dt>Actualizado em</dt>
            <dd>{formatTimestamp(meta.updatedAt)}</dd>
          </div>
        </dl>
      </header>

      <section className="admin-exercise-form-page__metrics" aria-label="Métricas da biblioteca">
        {hero.length ? (
          hero.map((metric) => (
            <article key={metric.id} className={`admin-exercise-form-page__metric tone-${metric.tone}`}>
              <header>
                <span className="admin-exercise-form-page__metricLabel">{metric.label}</span>
                {metric.trend ? (
                  <span
                    className={`admin-exercise-form-page__metricTrend direction-${metric.trend.direction}`}
                    aria-label={metric.trend.label}
                  >
                    <ArrowUpRight aria-hidden />
                    {metric.trend.label}
                  </span>
                ) : null}
              </header>
              <strong className="admin-exercise-form-page__metricValue">{metric.value}</strong>
              {metric.helper ? (
                <p className="admin-exercise-form-page__metricHelper">{metric.helper}</p>
              ) : null}
            </article>
          ))
        ) : (
          <p className="admin-exercise-form-page__metricsEmpty">
            Não foi possível carregar métricas em tempo real. As tuas alterações são guardadas na mesma.
          </p>
        )}
      </section>

      <section className="admin-exercise-form-page__form" aria-label="Formulário de edição de exercício">
        <AdminExerciseFormClient mode="edit" initial={initial} />
      </section>
    </div>
  );
}
