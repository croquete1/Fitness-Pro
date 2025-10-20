import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';

import AdminExerciseFormClient from '../AdminExerciseFormClient';
import { loadAdminExercisesDashboard } from '@/lib/admin/exercises/server';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default async function Page() {
  const dashboard = await loadAdminExercisesDashboard({ range: '90d', pageSize: 12 });
  const hero = dashboard.ok ? dashboard.data.hero : [];
  const generatedAt = dashboard.ok ? dashboard.data.generatedAt : null;
  const generatedLabel = generatedAt ? dateFormatter.format(new Date(generatedAt)) : null;

  return (
    <div className="admin-exercise-form-page">
      <header className="admin-exercise-form-page__header">
        <div>
          <h1>➕ Novo exercício</h1>
          <p>
            Actualiza a biblioteca global com dados reais. A criação fica imediatamente disponível nas dashboards de admin,
            personal trainer e cliente.
          </p>
        </div>
        {generatedLabel ? (
          <p className="admin-exercise-form-page__timestamp">
            Última sincronização: <time dateTime={generatedAt}>{generatedLabel}</time>
          </p>
        ) : null}
      </header>

      <section className="admin-exercise-form-page__metrics" aria-label="Estado actual da biblioteca">
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
            Não foi possível carregar métricas em tempo real. Ainda assim podes criar exercícios e sincronizar mais tarde.
          </p>
        )}
      </section>

      <section className="admin-exercise-form-page__form" aria-label="Formulário de criação de exercício">
        <AdminExerciseFormClient mode="create" />
      </section>
    </div>
  );
}
