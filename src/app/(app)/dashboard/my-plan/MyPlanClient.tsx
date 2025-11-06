'use client';

import * as React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type { ClientPlanOverviewResponse, ClientPlanOverviewRow } from '@/lib/client/plans/overview/types';
import type { PlanStatusKey } from '@/lib/plans/types';

const rangeOptions = [
  { label: 'Semana actual', value: 7 },
  { label: 'Próximas 2 semanas', value: 14 },
  { label: 'Próximas 4 semanas', value: 28 },
];

const fetcher = async (url: string): Promise<ClientPlanOverviewResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível sincronizar os planos.');
  }
  const payload = (await response.json()) as ClientPlanOverviewResponse & { ok?: boolean; message?: string };
  if (!payload?.ok) {
    throw new Error(payload?.message || 'Não foi possível sincronizar os planos.');
  }
  return payload;
};

function filterPlans(
  plans: ClientPlanOverviewRow[],
  status: 'all' | PlanStatusKey,
  query: string,
): ClientPlanOverviewRow[] {
  const q = query.trim().toLowerCase();
  return plans.filter((plan) => {
    if (status !== 'all' && plan.status !== status) return false;
    if (!q) return true;
    return plan.search.includes(q);
  });
}

function exportAgenda(data: ClientPlanOverviewResponse) {
  const rows = data.agenda.flatMap((day) =>
    day.items.map((item) => [
      day.dateLabel,
      day.label,
      item.planTitle,
      item.statusLabel,
      item.exercises,
      item.trainerName ?? item.trainerEmail ?? '—',
    ]),
  );
  if (!rows.length) return;
  const header = ['Data', 'Dia', 'Plano', 'Estado', 'Exercícios', 'Treinador'];
  const csv = [header, ...rows]
    .map((cols) =>
      cols
        .map((value) => {
          const str = value.toString();
          return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `agenda-planos-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type Props = {
  initialData: ClientPlanOverviewResponse;
  defaultRange: number;
};

export default function MyPlanClient({ initialData, defaultRange }: Props) {
  const [range, setRange] = React.useState(defaultRange);
  const [status, setStatus] = React.useState<'all' | PlanStatusKey>('all');
  const [query, setQuery] = React.useState('');

  const key = React.useMemo(() => `/api/client/plans/overview?days=${range}`, [range]);
  const { data, error, isValidating, mutate } = useSWR<ClientPlanOverviewResponse>(key, fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });

  const payload = data ?? initialData;
  const filteredPlans = React.useMemo(() => filterPlans(payload.plans, status, query), [payload.plans, status, query]);
  const hasAgenda = payload.agenda.some((day) => day.items.length > 0);
  const hasHeroMetrics = payload.hero.length > 0;
  const hasHighlights = payload.highlights.length > 0;

  const emptyStateTitle = payload.plans.length > 0 ? 'Sem resultados' : 'Ainda sem planos';
  const emptyStateDescription = payload.plans.length > 0
    ? 'Ajusta os filtros ou limpa a pesquisa para voltares a ver a lista completa.'
    : 'Assim que o teu PT publicar um plano vais recebê-lo automaticamente aqui.';

  return (
    <div className="client-page client-plan-overview">
      <PageHeader
        title="Os meus planos"
        subtitle="Confere a agenda semanal, vê destaques recentes e abre rapidamente cada plano."
        sticky={false}
      />

      {error ? (
        <Alert tone="danger" title="Falha ao sincronizar planos">
          {error.message || 'Volta a tentar dentro de alguns segundos.'}
        </Alert>
      ) : null}

      {payload.fallback ? (
        <Alert tone="warning" title="Modo offline">
          Alguns dados podem estar indisponíveis até restabeleceres ligação ao servidor.
        </Alert>
      ) : null}

      <section className="neo-panel client-plan-overview__hero" aria-label="Métricas principais">
        <div className="client-plan-overview__heroGrid">
          {hasHeroMetrics ? (
            payload.hero.map((metric) => (
              <article
                key={metric.id}
                className="client-plan-overview__heroCard"
                data-tone={metric.tone ?? 'neutral'}
              >
                <span className="client-plan-overview__heroLabel">{metric.label}</span>
                <strong className="client-plan-overview__heroValue">{metric.value}</strong>
                {metric.hint ? <span className="client-plan-overview__heroHint">{metric.hint}</span> : null}
              </article>
            ))
          ) : (
            <div className="client-plan-overview__empty" role="status">
              <p className="neo-text--muted">Sem métricas disponíveis para este período.</p>
            </div>
          )}
        </div>
      </section>

      <section className="client-plan-overview__toolbar" aria-label="Controlo da agenda">
        <div className="client-plan-overview__filters">
          <label className="neo-input-group__field client-plan-overview__search">
            <span className="neo-input-group__label">Pesquisar</span>
            <input
              className="neo-input"
              placeholder="Nome do plano ou treinador"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="neo-input-group__field">
            <span className="neo-input-group__label">Estado</span>
            <select
              className="neo-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as 'all' | PlanStatusKey)}
            >
              {payload.statuses.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="client-plan-overview__actions">
          <label className="neo-input-group__field client-plan-overview__range">
            <span className="neo-input-group__label">Período</span>
            <select
              className="neo-input"
              value={range}
              onChange={(event) => setRange(Number.parseInt(event.target.value, 10))}
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="client-plan-overview__toolbarButtons">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportAgenda(payload)}
              disabled={!hasAgenda}
            >
              Exportar agenda
            </Button>
            <Button variant="secondary" size="sm" onClick={() => mutate()} disabled={isValidating}>
              {isValidating ? 'A actualizar…' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </section>

      <section className="neo-panel client-plan-overview__agenda" aria-label="Agenda de treinos">
        <header className="client-plan-overview__sectionHeader">
          <div>
            <h2 className="neo-panel__title">Agenda</h2>
            <p className="neo-panel__subtitle">Dias com exercícios planeados para o período seleccionado.</p>
          </div>
        </header>
        {hasAgenda ? (
          <div className="client-plan-overview__agendaGrid">
            {payload.agenda.map((day) => (
              <article key={`${day.offset}-${day.label}`} className="client-plan-overview__agendaDay">
                <header className="client-plan-overview__agendaDayHeader" data-today={day.isToday || undefined}>
                  <div>
                    <span className="client-plan-overview__agendaWeekday">{day.label}</span>
                    <span className="client-plan-overview__agendaDate">{day.dateLabel}</span>
                  </div>
                  <span className="client-plan-overview__agendaTotal">
                    {day.totalExercises > 0
                      ? `${day.totalExercises} exercício${day.totalExercises === 1 ? '' : 's'}`
                      : 'Descanso'}
                  </span>
                </header>
                <ul className="client-plan-overview__agendaList">
                  {day.items.map((item) => (
                    <li key={`${day.offset}-${item.planId}`} className="client-plan-overview__agendaItem">
                      <div>
                        <span className="client-plan-overview__agendaPlan">{item.planTitle}</span>
                        <span className="client-plan-overview__agendaTrainer">
                          {item.trainerName ?? item.trainerEmail ?? 'Treinador por atribuir'}
                        </span>
                      </div>
                      <div className="client-plan-overview__agendaMeta">
                        <span className="neo-tag" data-tone={item.statusTone}>
                          {item.statusLabel}
                        </span>
                        <span className="client-plan-overview__agendaCount">
                          {item.exercises} exercício{item.exercises === 1 ? '' : 's'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              📅
            </span>
            <p className="neo-empty__title">Agenda vazia</p>
            <p className="neo-empty__description">
              Ainda não existem exercícios planeados para o período seleccionado.
            </p>
          </div>
        )}
      </section>

      <section className="neo-panel client-plan-overview__highlights" aria-label="Destaques recentes">
        <header className="client-plan-overview__sectionHeader">
          <div>
            <h2 className="neo-panel__title">Destaques</h2>
            <p className="neo-panel__subtitle">Resumo de mudanças e recomendações para acompanhar os teus planos.</p>
          </div>
        </header>
        {hasHighlights ? (
          <div className="client-plan-overview__highlightGrid">
            {payload.highlights.map((highlight) => (
              <article key={highlight.id} className="client-plan-overview__highlight" data-tone={highlight.tone}>
                <div className="client-plan-overview__highlightBody">
                  <h3>{highlight.title}</h3>
                  <p>{highlight.description}</p>
                </div>
                {highlight.icon ? (
                  <span className="client-plan-overview__highlightIcon" aria-hidden>
                    {highlight.icon === 'calendar' && '📆'}
                    {highlight.icon === 'plans' && '📋'}
                    {highlight.icon === 'alert' && '⚠️'}
                    {highlight.icon === 'check-circle' && '✅'}
                  </span>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="neo-empty">
            <span className="neo-empty__icon" aria-hidden>
              📌
            </span>
            <p className="neo-empty__title">Sem destaques no momento</p>
            <p className="neo-empty__description">
              Os destaques são gerados automaticamente quando existirem planos activos ou alterações recentes.
            </p>
          </div>
        )}
      </section>

      <section className="neo-panel client-plan-overview__tableSection" aria-label="Lista de planos">
        <header className="client-plan-overview__sectionHeader">
          <div>
            <h2 className="neo-panel__title">Planos</h2>
            <p className="neo-panel__subtitle">
              Consulta os detalhes principais e abre cada plano para veres os exercícios completos.
            </p>
          </div>
          <span className="client-plan-overview__lastUpdated">
            Actualizado {new Date(payload.updatedAt).toLocaleString('pt-PT')}
          </span>
        </header>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          {filteredPlans.length > 0 ? (
            <table className="neo-table client-plan-overview__table">
              <thead>
                <tr>
                  <th scope="col">Plano</th>
                  <th scope="col">Treinador</th>
                  <th scope="col">Período</th>
                  <th scope="col">Treinos/semana</th>
                  <th scope="col">Actualização</th>
                  <th scope="col" className="neo-table__cell--right">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td data-title="Plano">
                      <div className="client-plan-overview__planCell">
                        <span className="client-plan-overview__planTitle">{plan.title}</span>
                        <span className="neo-tag" data-tone={plan.statusTone}>
                          {plan.statusLabel}
                        </span>
                      </div>
                    </td>
                    <td data-title="Treinador">
                      {plan.trainerName ?? plan.trainerEmail ?? 'Treinador por atribuir'}
                    </td>
                    <td data-title="Período">
                      {plan.startDateLabel} – {plan.endDateLabel}
                    </td>
                    <td data-title="Treinos/semana">
                      {plan.exercisesPerWeek > 0 ? (
                        <span className="client-plan-overview__planMetric">
                          {plan.exercisesPerWeek} exercício{plan.exercisesPerWeek === 1 ? '' : 's'}
                          <span className="client-plan-overview__planMetricHint">
                            {plan.trainingDays} dia{plan.trainingDays === 1 ? '' : 's'}
                          </span>
                        </span>
                      ) : (
                        <span className="client-plan-overview__planMetric" data-empty>
                          Sem exercícios atribuídos
                        </span>
                      )}
                    </td>
                    <td data-title="Actualização">
                      <span className="client-plan-overview__planUpdated">{plan.updatedRelative}</span>
                      <span className="client-plan-overview__planUpdatedHint">{plan.updatedAtLabel}</span>
                    </td>
                    <td data-title="Ações" className="neo-table__cell--right">
                      <div className="neo-table__actions">
                        <Link href={plan.link} className="btn" data-variant="primary" data-size="sm">
                          Abrir plano
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="neo-table-empty">
              <p className="neo-table-empty__title">{emptyStateTitle}</p>
              <p className="neo-table-empty__description">{emptyStateDescription}</p>
              {payload.plans.length > 0 ? (
                <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
                  Limpar pesquisa
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
