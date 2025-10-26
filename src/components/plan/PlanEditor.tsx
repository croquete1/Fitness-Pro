'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
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

const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;

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
  sets?: number;
  reps?: number;
  notes?: string;
};

type InitialPlan = {
  trainerId: string;
  clientId: string;
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
  mediaUrl?: string;
  muscleUrl?: string;
};

type PickerResult = {
  q: string;
  setQ: (value: string) => void;
  items: ExerciseLite[];
  loading: boolean;
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

function useExerciseSearch(): PickerResult {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ExerciseLite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetcher = useMemo(
    () =>
      debounce(async (term: string) => {
        if (!term || term.trim().length < 2) {
          setItems([]);
          return;
        }
        try {
          setLoading(true);
          const res = await fetch(`/api/exercises?q=${encodeURIComponent(term.trim())}`, {
            cache: 'no-store',
          });
          const data = (await res.json()) as ExerciseLite[];
          setItems(Array.isArray(data) ? data : []);
        } catch {
          setItems([]);
        } finally {
          setLoading(false);
        }
      }, 320),
    []
  );

  useEffect(() => {
    fetcher(q);
  }, [q, fetcher]);

  return { q, setQ, items, loading };
}

function ExercisePicker({ onPick }: { onPick: (ex: ExerciseLite) => void }) {
  const { q, setQ, items, loading } = useExerciseSearch();
  const isIdle = !loading && q.trim().length >= 2 && items.length === 0;

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
        Pesquisa alimentada pela API de exercícios do servidor. Mínimo de 2 caracteres.
      </p>

      {loading && (
        <div className="plan-editor__pickerState" role="status">
          <Loader2 className="plan-editor__spinner" aria-hidden /> A procurar exercícios…
        </div>
      )}

      {isIdle && (
        <div className="plan-editor__pickerState" role="status">
          Nenhum exercício corresponde à pesquisa atual.
        </div>
      )}

      {items.length > 0 && (
        <ul className="plan-editor__suggestions" role="listbox" aria-label="Sugestões de exercícios">
          {items.map((item) => (
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
                  <span className="plan-editor__suggestionMeta">ID {item.id}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PlanEditor({ mode, initial, planId, onSaved, admin = false }: Props) {
  const router = useRouter();

  const [trainerId, setTrainerId] = useState(initial.trainerId);
  const [clientId, setClientId] = useState(initial.clientId);
  const [title, setTitle] = useState(initial.title);
  const [notes, setNotes] = useState(initial.notes);
  const [status, setStatus] = useState<PlanWorkflowStatus>(initial.status ?? 'PENDING');
  const [exercises, setExercises] = useState<Exercise[]>(initial.exercises ?? []);
  const [busy, setBusy] = useState(false);

  const [trainer, setTrainer] = useState<{ id: string; name?: string | null; email?: string | null } | null>(
    initial.trainerId ? { id: initial.trainerId, name: initial.trainerName } : null
  );
  const [client, setClient] = useState<{ id: string; name?: string | null; email?: string | null } | null>(
    initial.clientId ? { id: initial.clientId, name: initial.clientName } : null
  );

  const canSave = useMemo(() => {
    const hasTitle = title.trim().length >= 3;
    const hasExercises = exercises.length > 0;
    return Boolean(trainerId && clientId && hasTitle && hasExercises && !busy);
  }, [trainerId, clientId, title, exercises.length, busy]);

  const metrics = useMemo(() => {
    const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets ?? DEFAULT_SETS), 0);
    const totalReps = exercises.reduce((acc, ex) => acc + (ex.sets ?? DEFAULT_SETS) * (ex.reps ?? DEFAULT_REPS), 0);
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
      setExercises((prev) => [
        ...prev,
        {
          id: item.id,
          name: item.name,
          mediaUrl: item.mediaUrl,
          muscleUrl: item.muscleUrl,
          sets: DEFAULT_SETS,
          reps: DEFAULT_REPS,
          notes: '',
        },
      ]);
      toast('success', `Adicionado: ${item.name}`);
    },
    []
  );

  const updateExercise = useCallback((index: number, patch: Partial<Exercise>) => {
    setExercises((prev) => {
      const next = prev.slice();
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveExercise = useCallback((from: number, to: number) => {
    setExercises((prev) => {
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
        exercises,
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
                setTrainer(value);
                setTrainerId(value?.id ?? initial.trainerId);
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
                setClientId(value?.id ?? initial.clientId);
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
          </header>
          <ExercisePicker onPick={addExercise} />
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
                return (
                  <li key={`${exercise.id}-${index}`} className="plan-editor__exercise">
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
                      </header>

                      <div className="plan-editor__exerciseControls">
                        <label className="neo-input-group__field">
                          <span className="neo-input-group__label">Séries</span>
                          <input
                            type="number"
                            min={1}
                            className="neo-input neo-input--compact"
                            value={exercise.sets ?? DEFAULT_SETS}
                            onChange={(event) =>
                              updateExercise(index, {
                                sets: Number(event.target.value) || 0,
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
                            value={exercise.reps ?? DEFAULT_REPS}
                            onChange={(event) =>
                              updateExercise(index, {
                                reps: Number(event.target.value) || 0,
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
