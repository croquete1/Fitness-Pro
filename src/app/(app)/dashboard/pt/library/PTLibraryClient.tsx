'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import TrainerExerciseFormClient from './TrainerExerciseFormClient';
import type {
  TrainerLibraryDashboardData,
  TrainerLibraryHighlight,
  TrainerLibraryTableRow,
  TrainerLibraryTimelinePoint,
} from '@/lib/trainer/library/types';
import { normalizeDifficulty } from '@/lib/exercises/schema';

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível actualizar a biblioteca.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível actualizar a biblioteca.');
  }
  return payload as DashboardResponse;
};

type DashboardResponse = TrainerLibraryDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type Props = {
  initialData: DashboardResponse;
  viewerName: string | null;
};

type ScopeFilter = 'all' | 'personal' | 'global';

type TimelineTooltipPayload = {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: TrainerLibraryTimelinePoint }>;
};

const scopeLabels: Record<ScopeFilter, string> = {
  all: 'Todos',
  personal: 'Biblioteca pessoal',
  global: 'Catálogo global',
};

function matchesQuery(row: TrainerLibraryTableRow, query: string) {
  if (!query.trim()) return true;
  const value = query.trim().toLowerCase();
  return [
    row.name.toLowerCase(),
    row.description?.toLowerCase() ?? '',
    row.muscleTags.join(' ').toLowerCase(),
    row.equipmentTags.join(' ').toLowerCase(),
    row.difficultyLabel.toLowerCase(),
  ].some((field) => field.includes(value));
}

function exportRows(rows: TrainerLibraryTableRow[]) {
  const header = [
    'ID',
    'Nome',
    'Escopo',
    'Dificuldade',
    'Grupos musculares',
    'Equipamento',
    'Atualizado em',
  ];
  const body = rows.map((row) => [
    row.id,
    row.name,
    row.scopeLabel,
    row.difficultyLabel,
    row.muscleTags.join(' | '),
    row.equipmentTags.join(' | '),
    row.updatedLabel,
  ]);
  const csv = [header, ...body]
    .map((cells) =>
      cells
        .map((value) => {
          const safe = value ?? '';
          const needsQuotes = /[",;\n]/.test(safe);
          const escaped = safe.replace(/"/g, '""');
          return needsQuotes ? `"${escaped}"` : escaped;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `biblioteca-exercicios-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function TimelineTooltipContent({ active, payload }: TimelineTooltipPayload) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload;
  if (!datum) return null;
  return (
    <div className="trainer-library__tooltip" role="status">
      <strong>{datum.label}</strong>
      <dl>
        <div>
          <dt>Pessoais</dt>
          <dd>{datum.personal}</dd>
        </div>
        <div>
          <dt>Catálogo</dt>
          <dd>{datum.global}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{datum.total}</dd>
        </div>
      </dl>
    </div>
  );
}

function HighlightsList({ highlights }: { highlights: TrainerLibraryHighlight[] }) {
  if (!highlights.length) {
    return (
      <div className="trainer-library__empty" role="status">
        <p className="neo-text--muted">Sem destaques para mostrar.</p>
      </div>
    );
  }

  return (
    <ul className="trainer-library__highlights" role="list">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="trainer-library__highlight" data-tone={highlight.tone}>
          <div>
            <p className="trainer-library__highlightTitle">{highlight.title}</p>
            <p className="trainer-library__highlightDescription">{highlight.description}</p>
          </div>
          {highlight.meta ? <span className="trainer-library__highlightMeta">{highlight.meta}</span> : null}
          {highlight.href ? (
            <a href={highlight.href} className="trainer-library__highlightLink">
              Abrir secção
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function PTLibraryClient({ initialData, viewerName }: Props) {
  const { data, error, mutate, isValidating } = useSWR<DashboardResponse>(
    '/api/pt/library/dashboard',
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnMount: true,
    },
  );

  const dashboard = data ?? initialData;

  const [scopeFilter, setScopeFilter] = React.useState<ScopeFilter>('personal');
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>('all');
  const [muscleFilter, setMuscleFilter] = React.useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = React.useState<string>('all');
  const [query, setQuery] = React.useState('');
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [pendingRow, setPendingRow] = React.useState<string | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [editing, setEditing] = React.useState<TrainerLibraryTableRow | null>(null);
  const [preview, setPreview] = React.useState<TrainerLibraryTableRow | null>(null);

  const filteredRows = React.useMemo(() => {
    return dashboard.rows.filter((row) => {
      if (scopeFilter !== 'all' && row.scope !== scopeFilter) return false;
      if (difficultyFilter !== 'all' && row.difficulty !== difficultyFilter) return false;
      if (muscleFilter !== 'all' && !row.muscleTags.map((tag) => tag.toLowerCase()).includes(muscleFilter.toLowerCase())) {
        return false;
      }
      if (
        equipmentFilter !== 'all' &&
        !row.equipmentTags.map((tag) => tag.toLowerCase()).includes(equipmentFilter.toLowerCase())
      ) {
        return false;
      }
      return matchesQuery(row, query);
    });
  }, [dashboard.rows, scopeFilter, difficultyFilter, muscleFilter, equipmentFilter, query]);

  const supabaseState = dashboard.supabase ? 'ok' : 'warn';
  const supabaseLabel = dashboard.supabase ? 'Dados em tempo real' : 'Modo offline';

  const difficultyOptions = React.useMemo(
    () => dashboard.facets.difficulties.filter((facet) => facet.count > 0),
    [dashboard.facets.difficulties],
  );

  const handleRefresh = React.useCallback(() => {
    void mutate();
  }, [mutate]);

  const handleClone = React.useCallback(
    async (row: TrainerLibraryTableRow) => {
      setActionError(null);
      setPendingRow(row.id);
      try {
        const response = await fetch('/api/pt/library/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceId: row.id }),
        });
        if (!response.ok) {
          const message = await response.text().catch(() => '');
          throw new Error(message || 'Falha ao duplicar exercício.');
        }
        await mutate();
      } catch (err) {
        setActionError((err as Error).message);
      } finally {
        setPendingRow(null);
      }
    },
    [mutate],
  );

  const handleDelete = React.useCallback(
    async (row: TrainerLibraryTableRow) => {
      if (!window.confirm(`Remover "${row.name}" da tua biblioteca?`)) return;
      setActionError(null);
      setPendingRow(row.id);
      try {
        const response = await fetch(`/api/pt/library/exercises/${row.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const message = await response.text().catch(() => '');
          throw new Error(message || 'Falha ao remover exercício.');
        }
        await mutate();
      } catch (err) {
        setActionError((err as Error).message);
      } finally {
        setPendingRow(null);
      }
    },
    [mutate],
  );

  const handleFormSuccess = React.useCallback(() => {
    setShowCreate(false);
    setEditing(null);
    void mutate();
  }, [mutate]);

  const editingInitial = React.useMemo(() => {
    if (!editing) return undefined;
    return {
      id: editing.id,
      name: editing.name,
      muscle_group: editing.muscleGroup ?? editing.muscleTags.join(', '),
      equipment: editing.equipment ?? editing.equipmentTags.join(', '),
      difficulty: normalizeDifficulty(editing.difficultyRaw ?? editing.difficultyLabel) ?? undefined,
      description: editing.description ?? undefined,
      video_url: editing.videoUrl ?? undefined,
    };
  }, [editing]);

  return (
    <div className="trainer-library">
      <PageHeader
        title="Biblioteca de exercícios"
        subtitle={
          viewerName
            ? `Curadoria dos exercícios utilizados por ${viewerName}.`
            : 'Mantém o catálogo optimizado com dados em tempo real.'
        }
        actions={(
          <div className="trainer-library__status">
            <span className="status-pill" data-state={supabaseState}>
              {supabaseLabel}
            </span>
            <Button variant="ghost" size="sm" onClick={handleRefresh} loading={isValidating}>
              Atualizar
            </Button>
          </div>
        )}
        sticky={false}
      />

      {error ? (
        <Alert tone="danger" className="trainer-library__alert" title="Falha na sincronização">
          {error.message}
        </Alert>
      ) : null}

      {actionError ? (
        <Alert tone="warning" className="trainer-library__alert" title="Operação incompleta">
          {actionError}
        </Alert>
      ) : null}

      <section className="neo-panel trainer-library__panel" aria-labelledby="trainer-library-hero">
        <header className="trainer-library__panelHeader">
          <div>
            <h2 id="trainer-library-hero" className="neo-panel__title">
              Indicadores principais
            </h2>
            <p className="neo-panel__subtitle">
              Monitoriza a saúde da biblioteca pessoal e identifica oportunidades no catálogo global.
            </p>
          </div>
        </header>
        <div className="trainer-library__hero" role="list">
          {dashboard.hero.map((metric) => (
            <article key={metric.id} className="trainer-library__heroCard" data-tone={metric.tone ?? 'neutral'}>
              <span className="trainer-library__heroLabel">{metric.label}</span>
              <strong className="trainer-library__heroValue">{metric.value}</strong>
              {metric.trend ? <span className="trainer-library__heroTrend">{metric.trend}</span> : null}
              {metric.hint ? <span className="trainer-library__heroHint">{metric.hint}</span> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel trainer-library__panel" aria-labelledby="trainer-library-timeline">
        <header className="trainer-library__panelHeader">
          <div>
            <h2 id="trainer-library-timeline" className="neo-panel__title">
              Criações semanais
            </h2>
            <p className="neo-panel__subtitle">
              Evolução das criações pessoais e publicações globais nas últimas doze semanas.
            </p>
          </div>
        </header>
        {dashboard.timeline.length ? (
          <div className="trainer-library__chart">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dashboard.timeline} margin={{ top: 8, right: 24, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-border-subtle)" />
                <XAxis dataKey="label" stroke="var(--neo-text-subtle)" />
                <YAxis stroke="var(--neo-text-subtle)" allowDecimals={false} />
                <Tooltip content={<TimelineTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="personal"
                  stackId="count"
                  stroke="var(--neo-chart-primary)"
                  fill="var(--neo-chart-primary-soft)"
                  name="Pessoais"
                />
                <Area
                  type="monotone"
                  dataKey="global"
                  stackId="count"
                  stroke="var(--neo-chart-info)"
                  fill="var(--neo-chart-info-soft)"
                  name="Catálogo"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="trainer-library__empty" role="status">
            <p className="neo-text--muted">Ainda não existem dados suficientes para desenhar o gráfico.</p>
          </div>
        )}
      </section>

      <section className="neo-panel trainer-library__panel" aria-labelledby="trainer-library-difficulty">
        <header className="trainer-library__panelHeader">
          <div>
            <h2 id="trainer-library-difficulty" className="neo-panel__title">
              Distribuição por dificuldade
            </h2>
            <p className="neo-panel__subtitle">
              Garante equilíbrio entre exercícios de iniciação, progressão e desafio avançado.
            </p>
          </div>
        </header>
        <div className="trainer-library__distribution" role="list">
          {dashboard.difficulties.map((item) => (
            <article key={item.id} className="trainer-library__distributionCard" data-tone={item.tone}>
              <header>
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </header>
              <div className="trainer-library__distributionBar">
                <span style={{ width: `${Math.min(100, Math.round(item.percentage))}%` }} />
              </div>
              <footer>{item.percentage.toFixed(1)}%</footer>
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel trainer-library__panel" aria-labelledby="trainer-library-highlights">
        <header className="trainer-library__panelHeader">
          <div>
            <h2 id="trainer-library-highlights" className="neo-panel__title">
              Destaques operacionais
            </h2>
            <p className="neo-panel__subtitle">
              Insights rápidos que ajudam a decidir o próximo passo na curadoria da biblioteca.
            </p>
          </div>
        </header>
        <HighlightsList highlights={dashboard.highlights} />
      </section>

      <section className="neo-panel trainer-library__panel" aria-labelledby="trainer-library-table">
        <header className="trainer-library__panelHeader">
          <div>
            <h2 id="trainer-library-table" className="neo-panel__title">
              Exercícios catalogados
            </h2>
            <p className="neo-panel__subtitle">
              Filtra, duplica e mantém actualizados os exercícios que suportam os teus planos de treino.
            </p>
          </div>
          <div className="trainer-library__actions">
            <Button variant="ghost" size="sm" onClick={() => exportRows(filteredRows)} disabled={!filteredRows.length}>
              Exportar CSV
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              Novo exercício
            </Button>
          </div>
        </header>
        <div className="trainer-library__filters">
          <div className="trainer-library__segmented" role="group" aria-label="Filtro por origem">
            {(Object.keys(scopeLabels) as ScopeFilter[]).map((scope) => (
              <button
                key={scope}
                type="button"
                className="trainer-library__segment"
                data-active={scopeFilter === scope}
                onClick={() => setScopeFilter(scope)}
              >
                {scopeLabels[scope]}
              </button>
            ))}
          </div>
          <input
            type="search"
            className="trainer-library__search"
            placeholder="Procurar por nome, músculo ou equipamento"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="trainer-library__select"
            value={difficultyFilter}
            onChange={(event) => setDifficultyFilter(event.target.value)}
          >
            <option value="all">Todas as dificuldades</option>
            {difficultyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="trainer-library__select"
            value={muscleFilter}
            onChange={(event) => setMuscleFilter(event.target.value)}
          >
            <option value="all">Todos os músculos</option>
            {dashboard.facets.muscles.map((option) => (
              <option key={option.id} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="trainer-library__select"
            value={equipmentFilter}
            onChange={(event) => setEquipmentFilter(event.target.value)}
          >
            <option value="all">Todo o equipamento</option>
            {dashboard.facets.equipments.map((option) => (
              <option key={option.id} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="trainer-library__tableWrapper">
          <table className="trainer-library__table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Músculos</th>
                <th>Equipamento</th>
                <th>Dificuldade</th>
                <th>Escopo</th>
                <th>Actualizado</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="trainer-library__cell">
                        <strong>{row.name}</strong>
                        {row.description ? <span>{row.description}</span> : null}
                      </div>
                    </td>
                    <td>
                      <div className="trainer-library__tags">
                        {row.muscleTags.length
                          ? row.muscleTags.map((tag) => (
                              <span key={`${row.id}-muscle-${tag}`} className="trainer-library__tag">
                                {tag}
                              </span>
                            ))
                          : '—'}
                      </div>
                    </td>
                    <td>
                      <div className="trainer-library__tags">
                        {row.equipmentTags.length
                          ? row.equipmentTags.map((tag) => (
                              <span key={`${row.id}-equipment-${tag}`} className="trainer-library__tag">
                                {tag}
                              </span>
                            ))
                          : '—'}
                      </div>
                    </td>
                    <td>
                      <span className="trainer-library__status" data-tone={row.difficultyTone}>
                        {row.difficultyLabel}
                      </span>
                    </td>
                    <td>
                      <span className="trainer-library__status" data-tone={row.scopeTone}>
                        {row.scopeLabel}
                      </span>
                    </td>
                    <td>
                      <div className="trainer-library__cell">
                        <strong>{row.updatedRelative ?? '—'}</strong>
                        <span>{row.updatedLabel}</span>
                      </div>
                    </td>
                    <td>
                      <div className="trainer-library__rowActions">
                        <Button variant="ghost" size="sm" onClick={() => setPreview(row)}>
                          Pré-visualizar
                        </Button>
                        {row.scope === 'personal' ? (
                          <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
                            Editar
                          </Button>
                        ) : null}
                        {row.scope === 'global' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClone(row)}
                            loading={pendingRow === row.id}
                          >
                            Duplicar
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(row)}
                            loading={pendingRow === row.id}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="trainer-library__empty" role="status">
                      <p className="neo-text--muted">
                        Não encontrámos exercícios com os filtros actuais. Ajusta os critérios ou adiciona um novo exercício.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo exercício" size="lg">
        <TrainerExerciseFormClient mode="create" onSuccess={handleFormSuccess} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Editar exercício" size="lg">
        {editing ? (
          <TrainerExerciseFormClient
            mode="edit"
            initial={editingInitial}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>

      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.name ?? 'Pré-visualização'} size="lg">
        {preview ? (
          <div className="trainer-library__preview">
            <section>
              <h3>Descrição</h3>
              <p>{preview.description ?? 'Sem descrição disponível.'}</p>
            </section>
            <section>
              <h3>Grupos musculares</h3>
              <div className="trainer-library__tags">
                {preview.muscleTags.length ? preview.muscleTags.map((tag) => <span key={tag}>{tag}</span>) : '—'}
              </div>
            </section>
            <section>
              <h3>Equipamento</h3>
              <div className="trainer-library__tags">
                {preview.equipmentTags.length
                  ? preview.equipmentTags.map((tag) => <span key={tag}>{tag}</span>)
                  : '—'}
              </div>
            </section>
            <section>
              <h3>Dificuldade</h3>
              <span className="trainer-library__status" data-tone={preview.difficultyTone}>
                {preview.difficultyLabel}
              </span>
            </section>
            {preview.videoUrl ? (
              <section>
                <h3>Vídeo</h3>
                <div className="trainer-library__videoWrapper">
                  <iframe
                    src={preview.videoUrl}
                    title={preview.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
