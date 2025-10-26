'use client';

import * as React from 'react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PTExerciseNote from './PTExerciseNote';

export type PTExercise = {
  id: string;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  difficulty: string | null;
  updatedAt: string | null;
  createdAt: string | null;
};

type Props = {
  exercises: PTExercise[];
  supabase: boolean;
};

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
}

function formatRelative(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diff = Date.now() - date.getTime();
  const days = Math.round(diff / 86_400_000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;
  const months = Math.round(days / 30);
  if (months < 12) return `há ${months} mês${months === 1 ? '' : 'es'}`;
  const years = Math.round(months / 12);
  return `há ${years} ano${years === 1 ? '' : 's'}`;
}

const normalise = (value: string | null) => (value ? value.trim() : 'Não definido');

export default function PTExercisesClient({ exercises, supabase }: Props) {
  const [query, setQuery] = React.useState('');
  const [group, setGroup] = React.useState('all');
  const [difficulty, setDifficulty] = React.useState('all');

  const totals = React.useMemo(() => {
    const uniqueGroups = new Set<string>();
    const difficultyCount = new Map<string, number>();
    exercises.forEach((exercise) => {
      if (exercise.muscleGroup) uniqueGroups.add(exercise.muscleGroup);
      if (exercise.difficulty) {
        difficultyCount.set(exercise.difficulty, (difficultyCount.get(exercise.difficulty) ?? 0) + 1);
      }
    });

    const latestUpdate = exercises
      .map((exercise) => exercise.updatedAt ?? exercise.createdAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] ?? null;

    return {
      total: exercises.length,
      groups: uniqueGroups.size,
      latest: latestUpdate,
      hardest:
        Array.from(difficultyCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    };
  }, [exercises]);

  const muscleGroups = React.useMemo(() => {
    const values = new Map<string, number>();
    exercises.forEach((exercise) => {
      const key = normalise(exercise.muscleGroup);
      values.set(key, (values.get(key) ?? 0) + 1);
    });
    return Array.from(values.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => label);
  }, [exercises]);

  const difficulties = React.useMemo(() => {
    const values = new Map<string, number>();
    exercises.forEach((exercise) => {
      const key = normalise(exercise.difficulty);
      values.set(key, (values.get(key) ?? 0) + 1);
    });
    return Array.from(values.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => label);
  }, [exercises]);

  const filtered = React.useMemo(() => {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return exercises.filter((exercise) => {
      if (group !== 'all' && normalise(exercise.muscleGroup) !== group) return false;
      if (difficulty !== 'all' && normalise(exercise.difficulty) !== difficulty) return false;
      if (!terms.length) return true;
      const haystack = [
        exercise.name,
        exercise.muscleGroup ?? '',
        exercise.equipment ?? '',
        exercise.difficulty ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [difficulty, exercises, group, query]);

  return (
    <div className="pt-exercises neo-stack neo-stack--xl">
      <section className="neo-panel pt-exercises__summary" aria-label="Resumo de exercícios">
        <header className="neo-panel__header">
          <div className="neo-panel__meta">
            <h1 className="neo-panel__title">Biblioteca de exercícios</h1>
            <p className="neo-panel__subtitle">
              Pesquisa rápida da base de exercícios actualizada em tempo real.
            </p>
          </div>
          <div className="pt-exercises__status" role="status">
            <span className="status-pill" data-state={supabase ? 'ok' : 'warn'}>
              {supabase ? 'Ligação activa ao servidor' : 'Modo offline' }
            </span>
            {totals.latest ? (
              <span className="pt-exercises__statusHint">Última actualização {formatRelative(totals.latest)}</span>
            ) : null}
          </div>
        </header>

        <div className="pt-exercises__metrics" role="list">
          <article className="pt-exercises__metric" role="listitem">
            <span className="pt-exercises__metricLabel">Total catalogado</span>
            <strong className="pt-exercises__metricValue">{totals.total}</strong>
            <span className="pt-exercises__metricHint">exercícios activos</span>
          </article>
          <article className="pt-exercises__metric" role="listitem">
            <span className="pt-exercises__metricLabel">Grupos musculares</span>
            <strong className="pt-exercises__metricValue">{totals.groups}</strong>
            <span className="pt-exercises__metricHint">cobertura de segmentos</span>
          </article>
          <article className="pt-exercises__metric" role="listitem">
            <span className="pt-exercises__metricLabel">Dificuldade mais usada</span>
            <strong className="pt-exercises__metricValue">{totals.hardest ?? '—'}</strong>
            <span className="pt-exercises__metricHint">com base nos planos activos</span>
          </article>
        </div>

        <div className="pt-exercises__filters" role="group" aria-label="Filtros de pesquisa">
          <label className="neo-input-group pt-exercises__filter">
            <span className="neo-input-group__label">Pesquisar</span>
            <input
              type="search"
              className="neo-input"
              placeholder="Nome, músculo ou equipamento"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="neo-input-group pt-exercises__filter">
            <span className="neo-input-group__label">Grupo muscular</span>
            <select
              className="neo-input"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
            >
              <option value="all">Todos</option>
              {muscleGroups.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="neo-input-group pt-exercises__filter">
            <span className="neo-input-group__label">Dificuldade</span>
            <select
              className="neo-input"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="all">Todas</option>
              {difficulties.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="neo-panel pt-exercises__list" aria-label="Tabela de exercícios">
        {filtered.length === 0 ? (
          <div className="pt-exercises__empty" role="status">
            <p className="neo-text--muted">Sem exercícios para os filtros aplicados.</p>
            <Button variant="ghost" size="sm" onClick={() => { setQuery(''); setGroup('all'); setDifficulty('all'); }}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="neo-table-wrapper">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>Exercício</th>
                  <th>Grupo muscular</th>
                  <th>Equipamento</th>
                  <th>Dificuldade</th>
                  <th>Actualizado</th>
                  <th className="neo-table__cell--right">Notas</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exercise) => (
                  <tr key={exercise.id}>
                    <td>
                      <div className="pt-exercises__name">
                        <strong>{exercise.name}</strong>
                        {exercise.createdAt ? (
                          <span className="pt-exercises__secondary">Registado {formatDate(exercise.createdAt)}</span>
                        ) : null}
                      </div>
                    </td>
                    <td>{exercise.muscleGroup ?? '—'}</td>
                    <td>{exercise.equipment ?? '—'}</td>
                    <td>{exercise.difficulty ?? '—'}</td>
                    <td>{formatRelative(exercise.updatedAt ?? exercise.createdAt)}</td>
                    <td className="neo-table__cell--right">
                      <PTExerciseNote exerciseId={exercise.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!supabase && (
        <Alert tone="warning" title="Dados de exemplo">
          A ligação ao servidor não esteve disponível. A mostrar uma amostra curada de exercícios para manter a produtividade.
        </Alert>
      )}
    </div>
  );
}
