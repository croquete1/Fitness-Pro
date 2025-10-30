'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Dumbbell,
  Loader2,
  ScrollText,
  Trash2,
} from 'lucide-react';

import { showToast } from '@/components/ui/Toasts';
import UserSelect from '@/components/users/UserSelect';
import DataSourceBadge from '@/components/ui/DataSourceBadge';

const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;
const SEARCH_CACHE_TTL = 30_000; // 30s de cache por termo/owner

function toast(type: 'success' | 'error' | 'info' | 'warning', msg: string) {
  try {
    (showToast as any)({ type, text: msg });
    return;
  } catch {}
  try {
    (showToast as any)({ type, message: msg });
    return;
  } catch {}
  try {
    (showToast as any)(type, msg);
  } catch {
    /* noop */
  }
}

type PlanWorkflowStatus = 'PENDING' | 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'APPROVED' | 'SUSPENDED' | string;

type Exercise = {
  id: string;
  name: string;
  mediaUrl?: string;
  muscleUrl?: string;
  muscleGroup?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  scope?: 'personal' | 'global';
  sets?: number;
  reps?: number;
  notes?: string;
};

type InitialPlan = {
  trainerId: string | null;
  clientId: string | null;
  trainerName?: string | null;
  clientName?: string | null;
  title: string;
  notes: string;
  status: PlanWorkflowStatus;
  exercises: Exercise[];
};

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial: InitialPlan;
  planId?: string;
  admin?: boolean;
  onSaved?: (id: string) => void;
};

type ExerciseLite = {
  id: string;
  name: string;
  mediaUrl?: string | null;
  muscleUrl?: string | null;
  muscleGroup?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  scope?: 'personal' | 'global';
};

type PickerResult = {
  q: string;
  setQ: (value: string) => void;
  items: ExerciseLite[];
  loading: boolean;
  error: string | null;
  warning: string | null;
  source: 'supabase' | 'fallback' | null;
  generatedAt: string | null;
  retry: () => void;
};

type SearchCacheEntry = {
  items: ExerciseLite[];
  source: 'supabase' | 'fallback';
  warning: string | null;
  generatedAt: string | null;
  timestamp: number;
};

const STATUS_OPTIONS: PlanWorkflowStatus[] = [
  'PENDING',
  'ACTIVE',
  'APPROVED',
  'SUSPENDED',
  'DRAFT',
  'ARCHIVED',
];

function debounce<F extends (...args: any[]) => void>(fn: F, ms = 320) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function normaliseScope(scope: Exercise['scope']): Exercise['scope'] {
  if (scope === 'global' || scope === 'personal') return scope;
  return 'personal';
}

function ensurePositiveInteger(value: number | null | undefined, fallback: number): number {
  if (typeof value !== 'number') return fallback;
  if (!Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  return Math.max(1, rounded);
}

function sanitiseExercise(exercise: Exercise): Exercise {
  return {
    id: exercise.id,
    name: exercise.name,
    mediaUrl: exercise.mediaUrl,
    muscleUrl: exercise.muscleUrl,
    muscleGroup: exercise.muscleGroup ?? null,
    equipment: exercise.equipment ?? null,
    difficulty: exercise.difficulty ?? null,
    scope: normaliseScope(exercise.scope),
    sets: ensurePositiveInteger(exercise.sets, DEFAULT_SETS),
    reps: ensurePositiveInteger(exercise.reps, DEFAULT_REPS),
    notes: exercise.notes ?? '',
  };
}

function parsePositiveIntegerFromInput(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, parsed);
}

function makeCacheKey(term: string, ownerId: string | null) {
  const safeTerm = term.trim().toLowerCase();
  return `${ownerId ?? 'global-only'}::${safeTerm}`;
}

function useExerciseSearch(ownerId?: string | null): PickerResult {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ExerciseLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'fallback' | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const latestTermRef = useRef('');
  const cacheRef = useRef<Map<string, SearchCacheEntry>>(new Map());
  const ownerRef = useRef<string | null>(ownerId ?? null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const currentOwner = ownerId ?? null;
    if (ownerRef.current === currentOwner) return;
    ownerRef.current = currentOwner;
    cacheRef.current.clear();
    abortRef.current?.abort();
    abortRef.current = null;
    latestTermRef.current = '';
    setItems([]);
    setSource(null);
    setGeneratedAt(null);
    setWarning(null);
    setError(null);
    setLoading(false);
  }, [ownerId]);

  const executeSearch = useCallback(async (term: string, owner: string | null) => {
    const cacheKey = makeCacheKey(term, owner);
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
      abortRef.current?.abort();
      abortRef.current = null;
      setItems(cached.items);
      setSource(cached.source);
      setGeneratedAt(cached.generatedAt);
      setWarning(cached.warning);
      setError(null);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const params = new URLSearchParams({ q: term });
      if (owner) params.set('ownerId', owner);

      const response = await fetch(`/api/exercises?${params.toString()}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            source?: 'supabase' | 'fallback';
            generatedAt?: string | null;
            items?: any[];
            error?: string;
            message?: string;
          }
        | any[]
        | null;

      if (!payload) {
        throw new Error('Não foi possível carregar exercícios.');
      }

      if (!response.ok && !Array.isArray(payload) && payload.ok !== true) {
        const message = typeof payload.error === 'string' ? payload.error : null;
        throw new Error(message || 'Não foi possível carregar exercícios.');
      }

      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.items)
          ? payload.items
          : [];

      const map = new Map<string, ExerciseLite>();
      for (const entry of rows) {
        const idCandidate = typeof entry?.id === 'string' ? entry.id : String(entry?.id ?? '');
        const nameCandidate = typeof entry?.name === 'string' ? entry.name : '';
        if (!idCandidate || !nameCandidate) continue;

        const record: ExerciseLite = {
          id: idCandidate,
          name: nameCandidate,
          mediaUrl:
            typeof entry?.mediaUrl === 'string'
              ? entry.mediaUrl
              : typeof entry?.video_url === 'string'
                ? entry.video_url
                : null,
          muscleGroup:
            typeof entry?.muscleGroup === 'string'
              ? entry.muscleGroup
              : typeof entry?.muscle_group === 'string'
                ? entry.muscle_group
                : null,
          equipment: typeof entry?.equipment === 'string' ? entry.equipment : null,
          difficulty: typeof entry?.difficulty === 'string' ? entry.difficulty : null,
          scope: entry?.scope === 'global' ? 'global' : 'personal',
        };

        if (!map.has(record.id)) {
          map.set(record.id, record);
        }
      }

      const nextItems = Array.from(map.values());
      const payloadObject = Array.isArray(payload) ? null : payload;
      const resolvedSource = payloadObject?.source === 'fallback' ? 'fallback' : 'supabase';
      const resolvedWarning =
        resolvedSource === 'fallback'
          ? payloadObject?.message ??
            'A mostrar catálogo determinístico por falta de ligação ao servidor.'
          : null;
      const generated = payloadObject?.generatedAt && typeof payloadObject.generatedAt === 'string'
        ? payloadObject.generatedAt
        : new Date().toISOString();

      setItems(nextItems);
      setSource(resolvedSource);
      setWarning(resolvedWarning);
      setGeneratedAt(generated);

      cacheRef.current.set(cacheKey, {
        items: nextItems,
        source: resolvedSource,
        warning: resolvedWarning,
        generatedAt: generated,
        timestamp: Date.now(),
      });
    } catch (err) {
      if ((err as { name?: string } | null)?.name === 'AbortError') return;
      cacheRef.current.delete(cacheKey);
      setItems([]);
      setSource(null);
      setGeneratedAt(null);
      setWarning(null);
      setError(err instanceof Error ? err.message : 'Não foi possível carregar exercícios.');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(executeSearch, 320), [executeSearch]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      abortRef.current?.abort();
      latestTermRef.current = '';
      setItems([]);
      setError(null);
      setWarning(null);
      setSource(null);
      setGeneratedAt(null);
      setLoading(false);
      return;
    }

    latestTermRef.current = term;
    debouncedSearch(term, ownerId ?? null);
  }, [q, ownerId, debouncedSearch]);

  const retry = useCallback(() => {
    const term = latestTermRef.current;
    if (term.length < 2) return;
    const owner = ownerId ?? null;
    cacheRef.current.delete(makeCacheKey(term, owner));
    executeSearch(term, owner);
  }, [executeSearch, ownerId]);

  return { q, setQ, items, loading, error, warning, source, generatedAt, retry };
}

function ExercisePicker({
  onPick,
  search,
  admin,
  trainerSelected,
}: {
  onPick: (ex: ExerciseLite) => void;
  search: PickerResult;
  admin: boolean;
  trainerSelected: boolean;
}) {
  const { q, setQ, items, loading, error, warning, retry } = search;
  const query = q.trim();
  const hasQuery = query.length >= 2;
  const showEmpty = !loading && hasQuery && !error && items.length === 0;

  return (
    <div className="plan-editor__picker">
      <div className="neo-input-group">
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Adicionar exercício</span>
          <input
            className="neo-input"
            placeholder="Pesquisa real na biblioteca…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            aria-label="Pesquisar exercício"
          />
        </label>
      </div>

      <p className="plan-editor__pickerHint">
        Introduz pelo menos 2 caracteres para pesquisar na biblioteca em tempo real.
      </p>

      {admin && !trainerSelected ? (
        <div className="plan-editor__pickerState" role="status" data-tone="info">
          Seleciona um Personal Trainer para incluir a biblioteca pessoal desse profissional.
        </div>
      ) : null}

      {warning ? (
        <div className="plan-editor__pickerState" role="status" data-tone="warning">
          {warning}
        </div>
      ) : null}

      {error ? (
        <div className="plan-editor__pickerState" role="alert" data-tone="error">
          <span>{error}</span>
          <button
            type="button"
            className="btn chip"
            onClick={retry}
            disabled={loading}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="plan-editor__pickerState" role="status">
          <Loader2 className="plan-editor__spinner" aria-hidden /> A procurar exercícios…
        </div>
      ) : null}

      {showEmpty ? (
        <div className="plan-editor__pickerState" role="status">
          Nenhum exercício corresponde à pesquisa atual.
        </div>
      ) : null}

      {items.length > 0 ? (
        <ul className="plan-editor__suggestions" role="listbox" aria-label="Sugestões de exercícios">
          {items.map((item) => {
            const scopeLabel = item.scope === 'global' ? 'Catálogo global' : 'Biblioteca pessoal';
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="plan-editor__suggestion"
                  onClick={() => onPick(item)}
                >
                  <span className="plan-editor__suggestionMedia">
                    <Image
                      src={item.mediaUrl || '/exercise-placeholder.png'}
                      alt=""
                      width={48}
                      height={48}
                    />
                  </span>
                  <span className="plan-editor__suggestionInfo">
                    <span className="plan-editor__suggestionTitle">{item.name}</span>
                    <span className="plan-editor__suggestionMeta">
                      {scopeLabel}
                      {item.muscleGroup ? ` · ${item.muscleGroup}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default function PlanEditor({ mode, initial, planId, onSaved, admin = false }: Props) {
  const router = useRouter();

  const [trainerId, setTrainerId] = useState<string | null>(initial.trainerId || null);
  const [clientId, setClientId] = useState<string | null>(initial.clientId || null);
  const [title, setTitle] = useState(initial.title);
  const [notes, setNotes] = useState(initial.notes);
  const [status, setStatus] = useState<PlanWorkflowStatus>(initial.status ?? 'PENDING');
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    (initial.exercises ?? []).map((exercise) => sanitiseExercise(exercise)),
  );
  const [busy, setBusy] = useState(false);

  const [trainer, setTrainer] = useState<{ id: string; name?: string | null; email?: string | null } | null>(
    initial.trainerId ? { id: initial.trainerId, name: initial.trainerName } : null
  );
  const [client, setClient] = useState<{ id: string; name?: string | null; email?: string | null } | null>(
    initial.clientId ? { id: initial.clientId, name: initial.clientName } : null
  );

  const exerciseSearch = useExerciseSearch(trainerId);
  const { setQ: setSearchTerm } = exerciseSearch;

  const canSave = useMemo(() => {
    const hasTitle = title.trim().length >= 3;
    const hasExercises = exercises.length > 0;
    return Boolean(trainerId && clientId && hasTitle && hasExercises && !busy);
  }, [trainerId, clientId, title, exercises.length, busy]);

  const metrics = useMemo(() => {
    const totalSets = exercises.reduce(
      (acc, ex) => acc + ensurePositiveInteger(ex.sets, DEFAULT_SETS),
      0,
    );
    const totalReps = exercises.reduce(
      (acc, ex) =>
        acc +
        ensurePositiveInteger(ex.sets, DEFAULT_SETS) *
          ensurePositiveInteger(ex.reps, DEFAULT_REPS),
      0,
    );
    const withNotes = exercises.filter((ex) => (ex.notes ?? '').trim().length > 0).length;
    return [
      { label: 'Exercícios', value: exercises.length, tone: 'primary', meta: 'Itens ativos no plano' },
      { label: 'Séries totais', value: totalSets, tone: 'success', meta: 'Volume planeado' },
      { label: 'Repetições estimadas', value: totalReps, tone: 'neutral', meta: 'Séries × repetições' },
      { label: 'Notas preenchidas', value: withNotes, tone: withNotes ? 'info' : 'neutral', meta: 'Exercícios com indicações' },
    ];
  }, [exercises]);

  const addExercise = useCallback(
    (item: ExerciseLite) => {
      let added = false;
      setExercises((prev) => {
        if (prev.some((exercise) => exercise.id === item.id)) {
          return prev;
        }

        added = true;
        return [
          ...prev,
          sanitiseExercise({
            id: item.id,
            name: item.name,
            mediaUrl: item.mediaUrl ?? undefined,
            muscleUrl: item.muscleUrl ?? undefined,
            muscleGroup: item.muscleGroup ?? null,
            equipment: item.equipment ?? null,
            difficulty: item.difficulty ?? null,
            scope: item.scope ?? 'personal',
            sets: DEFAULT_SETS,
            reps: DEFAULT_REPS,
            notes: '',
          }),
        ];
      });

      if (!added) {
        toast('info', 'Este exercício já está no plano.');
        return;
      }

      toast('success', `Adicionado: ${item.name}`);
      setSearchTerm('');
    },
    [setSearchTerm],
  );

  const updateExercise = useCallback((index: number, patch: Partial<Exercise>) => {
    setExercises((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = prev.slice();
      next[index] = sanitiseExercise({ ...next[index], ...patch });
      return next;
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveExercise = useCallback((from: number, to: number) => {
    setExercises((prev) => {
      if (from === to) return prev;
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length) {
        return prev;
      }
      const next = prev.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    try {
      setBusy(true);
      const payload = {
        trainerId,
        clientId,
        title: title.trim(),
        notes,
        status,
        exercises: exercises.map((exercise) => sanitiseExercise(exercise)),
      };

      let res: Response;
      if (mode === 'create') {
        res = await fetch('/api/pt/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        if (!planId) throw new Error('planId em falta');
        res = await fetch(`/api/pt/plans/${encodeURIComponent(planId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Falha ao ${mode === 'create' ? 'criar' : 'guardar'} o plano`);
      }

      const data = await res.json().catch(() => ({}));
      const id = data?.id ?? planId;

      toast('success', 'Plano guardado com sucesso!');

      if (onSaved && id) onSaved(id);
      else router.push('/dashboard/pt');
    } catch (error: any) {
      toast('error', error?.message ?? 'Erro ao guardar o plano');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="plan-editor" onSubmit={handleSave} aria-live="polite">
      <section className="neo-panel plan-editor__panel" aria-labelledby="plan-editor-heading">
        <header className="plan-editor__header">
          <div>
            <h1 id="plan-editor-heading" className="plan-editor__title">
              {mode === 'create' ? 'Criar plano de treino' : 'Editar plano de treino'}
            </h1>
            <p className="plan-editor__subtitle">
              Define o plano de treino com dados reais e acompanha o impacto das alterações em tempo real.
            </p>
          </div>
          <ul className="plan-editor__metrics" role="list">
            {metrics.map((metric) => (
              <li key={metric.label}>
                <article className="neo-surface" data-variant={metric.tone}>
                  <span className="neo-surface__label">{metric.label}</span>
                  <span className="neo-surface__value">{metric.value}</span>
                  <span className="neo-surface__meta">{metric.meta}</span>
                </article>
              </li>
            ))}
          </ul>
        </header>

        <div className="plan-editor__grid">
          <div className="neo-input-group plan-editor__stack">
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Título</span>
              <input
                className="neo-input"
                placeholder="Ex.: Hipertrofia avançada A/B"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={3}
              />
            </label>
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Estado</span>
              <select
                className="neo-input"
                value={status}
                onChange={(event) => setStatus(event.target.value as PlanWorkflowStatus)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="neo-input-group plan-editor__participants">
            <UserSelect
              label="Personal Trainer"
              role="TRAINER"
              value={trainer}
              onChange={(value) => {
                const previousTrainerId = trainerId;
                const nextTrainerId = value?.id ?? null;

                setTrainer(value);
                setTrainerId(nextTrainerId);

                if (previousTrainerId !== nextTrainerId) {
                  let removedPersonal = 0;
                  setExercises((prev) => {
                    if (!prev.length) return prev;
                    const nextList = prev.filter((exercise) => {
                      if (exercise.scope === 'personal') {
                        removedPersonal += 1;
                        return false;
                      }
                      return true;
                    });
                    return removedPersonal ? nextList : prev;
                  });

                  setSearchTerm('');

                  if (removedPersonal > 0) {
                    toast(
                      'warning',
                      removedPersonal === 1
                        ? 'Removemos 1 exercício pessoal ao trocar de PT; mantém apenas o catálogo global.'
                        : `Removemos ${removedPersonal} exercícios pessoais ao trocar de PT; mantém apenas o catálogo global.`,
                    );
                  }
                }
              }}
              placeholder="Seleciona o PT responsável…"
              disabled={!admin}
            />
            <UserSelect
              label="Cliente"
              role="CLIENT"
              value={client}
              onChange={(value) => {
                setClient(value);
                setClientId(value?.id ?? null);
              }}
              placeholder="Escolhe o cliente alvo…"
            />
          </div>
        </div>

        <label className="neo-input-group__field plan-editor__notes">
          <span className="neo-input-group__label">Notas gerais</span>
          <textarea
            className="neo-input neo-input--textarea"
            placeholder="Observações, diretrizes de carga, RIR, postura, etc."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <span className="neo-input-group__hint">
            Estas notas ficam visíveis para o cliente e o personal trainer.
          </span>
        </label>
      </section>

      <div className="plan-editor__layout">
        <section className="neo-panel plan-editor__pickerPanel">
          <header className="plan-editor__sectionHeader">
            <div>
              <h2 className="plan-editor__sectionTitle">
                <Dumbbell aria-hidden size={18} /> Biblioteca de exercícios
              </h2>
              <p className="plan-editor__sectionSubtitle">Pesquisa em tempo real na biblioteca oficial.</p>
            </div>
            <DataSourceBadge source={exerciseSearch.source ?? undefined} generatedAt={exerciseSearch.generatedAt} />
          </header>
          <ExercisePicker
            onPick={addExercise}
            search={exerciseSearch}
            admin={admin}
            trainerSelected={Boolean(trainerId)}
          />
        </section>

        <section className="neo-panel plan-editor__exercisePanel">
          <header className="plan-editor__sectionHeader">
            <div>
              <h2 className="plan-editor__sectionTitle">
                <ScrollText aria-hidden size={18} /> Exercícios do plano
              </h2>
              <p className="plan-editor__sectionSubtitle">
                Ajusta séries, repetições e notas para cada exercício. Usa as setas para organizar a ordem do treino.
              </p>
            </div>
          </header>

          {exercises.length === 0 ? (
            <div className="neo-empty plan-editor__empty">
              <span className="neo-empty__icon" aria-hidden>
                🏋️
              </span>
              <p className="neo-empty__title">Ainda sem exercícios</p>
              <p className="neo-empty__description">
                Pesquisa na biblioteca ao lado para adicionar exercícios reais ao plano.
              </p>
            </div>
          ) : (
            <ul className="plan-editor__exerciseList">
              {exercises.map((exercise, index) => {
                const canMoveUp = index > 0;
                const canMoveDown = index < exercises.length - 1;
                const metaSegments: string[] = [];
                if (exercise.scope) {
                  metaSegments.push(
                    exercise.scope === 'global' ? 'Catálogo global' : 'Biblioteca pessoal',
                  );
                }
                if (exercise.muscleGroup) metaSegments.push(exercise.muscleGroup);
                if (exercise.equipment) metaSegments.push(exercise.equipment);
                if (exercise.difficulty) metaSegments.push(exercise.difficulty);
                return (
                  <li key={exercise.id} className="plan-editor__exercise">
                    <div className="plan-editor__media">
                      <Image
                        src={exercise.mediaUrl || '/exercise-placeholder.png'}
                        alt=""
                        fill
                        sizes="96px"
                      />
                    </div>

                    <div className="plan-editor__exerciseContent">
                      <header className="plan-editor__exerciseHeader">
                        <h3 className="plan-editor__exerciseTitle">{exercise.name}</h3>
                        {metaSegments.length ? (
                          <p className="plan-editor__exerciseMeta">{metaSegments.join(' · ')}</p>
                        ) : null}
                      </header>

                      <div className="plan-editor__exerciseControls">
                        <label className="neo-input-group__field">
                          <span className="neo-input-group__label">Séries</span>
                          <input
                            type="number"
                            min={1}
                            className="neo-input neo-input--compact"
                            value={ensurePositiveInteger(exercise.sets, DEFAULT_SETS)}
                            onChange={(event) =>
                              updateExercise(index, {
                                sets: parsePositiveIntegerFromInput(
                                  event.target.value,
                                  ensurePositiveInteger(exercise.sets, DEFAULT_SETS),
                                ),
                              })
                            }
                          />
                        </label>
                        <label className="neo-input-group__field">
                          <span className="neo-input-group__label">Repetições</span>
                          <input
                            type="number"
                            min={1}
                            className="neo-input neo-input--compact"
                            value={ensurePositiveInteger(exercise.reps, DEFAULT_REPS)}
                            onChange={(event) =>
                              updateExercise(index, {
                                reps: parsePositiveIntegerFromInput(
                                  event.target.value,
                                  ensurePositiveInteger(exercise.reps, DEFAULT_REPS),
                                ),
                              })
                            }
                          />
                        </label>
                        <label className="neo-input-group__field plan-editor__exerciseNote">
                          <span className="neo-input-group__label">Notas</span>
                          <input
                            className="neo-input"
                            value={exercise.notes ?? ''}
                            onChange={(event) =>
                              updateExercise(index, {
                                notes: event.target.value,
                              })
                            }
                            placeholder="Carga, tempo sob tensão, respiração…"
                          />
                        </label>
                      </div>

                      {exercise.muscleUrl && (
                        <div className="plan-editor__muscleMap">
                          <Image
                            src={exercise.muscleUrl}
                            alt="Músculos trabalhados"
                            fill
                            sizes="240px"
                          />
                        </div>
                      )}
                    </div>

                    <div className="plan-editor__exerciseActions">
                      <button
                        type="button"
                        className="neo-icon-button"
                        onClick={() => moveExercise(index, Math.max(0, index - 1))}
                        aria-label="Mover exercício para cima"
                        disabled={!canMoveUp}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="neo-icon-button"
                        onClick={() => moveExercise(index, Math.min(exercises.length - 1, index + 1))}
                        aria-label="Mover exercício para baixo"
                        disabled={!canMoveDown}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="neo-icon-button"
                        onClick={() => removeExercise(index)}
                        aria-label="Remover exercício"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <footer className="plan-editor__footer">
        <button
          type="submit"
          className="neo-button neo-button--primary"
          disabled={!canSave}
        >
          {busy ? (
            <>
              <Loader2 className="plan-editor__spinner" aria-hidden /> A guardar…
            </>
          ) : mode === 'create' ? (
            'Criar plano'
          ) : (
            'Guardar alterações'
          )}
        </button>
        {!canSave && (
          <span className="plan-editor__footerHint">
            Preenche título, participantes e adiciona pelo menos um exercício para guardar o plano.
          </span>
        )}
      </footer>
    </form>
  );
}
