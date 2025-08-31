// src/components/plan/PlanEditor.tsx
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
import { Status } from '@prisma/client';
import { useToast } from '@/components/ui/Toasts';
import UserSelect from '@/components/users/UserSelect';

/* ================== Tipos ================== */
type Exercise = {
  id: string;
  name: string;
  /** URL de média do exercício (gif/video/png) */
  mediaUrl?: string;
  /** imagem/diagrama de músculos */
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
  status: Status;
  exercises: Exercise[];
};

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial: InitialPlan;
  /** só no modo edit */
  planId?: string;
  admin?: boolean;
  /** callback opcional, p/ fechar modal ou navegar */
  onSaved?: (id: string) => void;
};

/* ================== Utils ================== */
function debounce<F extends (...args: any[]) => void>(fn: F, ms = 300) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ================== Autocomplete de Utilizadores ================== */
type UserLite = { id: string; name: string; email?: string };

function useUserSearch(role: 'TRAINER' | 'CLIENT') {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);

  // pedir ao server (route: /api/users/search?role=TRAINER|CLIENT&q=xxx)
  const fetcher = useMemo(
    () =>
      debounce(async (term: string) => {
        if (!term || term.trim().length < 2) {
          setItems([]);
          return;
        }
        try {
          setLoading(true);
          const res = await fetch(
            `/api/users/search?role=${encodeURIComponent(role)}&q=${encodeURIComponent(term.trim())}`,
            { cache: 'no-store' }
          );
          const data = (await res.json()) as UserLite[];
          setItems(Array.isArray(data) ? data : []);
        } catch {
          // silencioso
        } finally {
          setLoading(false);
        }
      }, 300),
    [role]
  );

  useEffect(() => {
    fetcher(q);
  }, [q, fetcher]);

  return { q, setQ, items, loading };
}

function UserTypeahead({
  label,
  role,
  onChange,
}: {
  label: string;
  role: 'TRAINER' | 'CLIENT';
  value?: string;
  onChange: (user: UserLite) => void;
}) {
  const { q, setQ, items, loading } = useUserSearch(role);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(items.length > 0 && q.trim().length >= 2);
  }, [items, q]);

  return (
    <div className="grid gap-1" style={{ position: 'relative' }}>
      <label className="text-xs opacity-70">{label}</label>
      <input
        className="h-10 rounded-lg border px-3"
        style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
        placeholder={`Procurar ${role === 'TRAINER' ? 'treinador' : 'cliente'}…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(items.length > 0)}
      />
      {loading && (
        <div className="text-xs opacity-70">A procurar…</div>
      )}

      {open && (
        <div
          className="absolute z-20 w-full rounded-xl border shadow-lg"
          style={{
            top: '100%',
            marginTop: 6,
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
            maxHeight: 280,
            overflow: 'auto',
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {items.length === 0 ? (
            <div className="p-3 text-sm opacity-70">Sem resultados…</div>
          ) : (
            items.map((it) => (
              <button
                key={it.id}
                className="w-full text-left px-3 py-2 hover:bg-[var(--hover)]"
                onClick={() => {
                  onChange(it);
                  setQ(it.name || it.email || it.id);
                  setOpen(false);
                }}
              >
                <div className="text-sm font-medium">{it.name ?? '—'}</div>
                <div className="text-xs opacity-70">{it.email ?? it.id}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ================== Picker de Exercícios ================== */
type ExerciseLite = {
  id: string;
  name: string;
  mediaUrl?: string;
  muscleUrl?: string;
};

function useExerciseSearch() {
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
          // Espera-se um array [{id,name,mediaUrl,muscleUrl}]
          const data = (await res.json()) as ExerciseLite[];
          setItems(Array.isArray(data) ? data : []);
        } catch {
          // silencioso
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    fetcher(q);
  }, [q, fetcher]);

  return { q, setQ, items, loading };
}

function ExercisePicker({ onPick }: { onPick: (ex: ExerciseLite) => void }) {
  const { q, setQ, items, loading } = useExerciseSearch();

  return (
    <div className="grid gap-2">
      <div className="grid gap-1">
        <label className="text-xs opacity-70">Adicionar exercício</label>
        <input
          className="h-10 rounded-lg border px-3"
          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
          placeholder="Pesquisar exercício por nome…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading && <div className="text-xs opacity-70">A procurar…</div>}

      {items.length > 0 && (
        <div className="grid gap-2" style={{ maxHeight: 280, overflow: 'auto' }}>
          {items.map((it) => (
            <button
              key={it.id}
              className="flex items-center gap-3 rounded-xl border p-2 text-left hover:bg-[var(--hover)]"
              style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
              onClick={() => onPick(it)}
            >
              <div className="relative h-12 w-12 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <Image
                  src={it.mediaUrl || '/exercise-placeholder.png'}
                  alt=""
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="grid">
                <div className="text-sm font-medium">{it.name}</div>
                <div className="text-xs opacity-70">{it.id}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================== PlanEditor ================== */
export default function PlanEditor({
  mode,
  initial,
  planId,
  onSaved,
  admin: _admin = false,
}: Props) {
  const router = useRouter();

  const [trainerId, setTrainerId] = useState(initial.trainerId);
  const [clientId, setClientId] = useState(initial.clientId);
  const [title, setTitle] = useState(initial.title);
  const [notes, setNotes] = useState(initial.notes);
  const [status, setStatus] = useState<Status>(initial.status ?? 'PENDING');
  const [exercises, setExercises] = useState<Exercise[]>(initial.exercises ?? []);
  const [busy, setBusy] = useState(false);

  // Toast context (seguro para várias implementações)
  const toastCtx = (useToast?.() as any) || null;
  const notify = useCallback((payload: { kind?: string; message: string; title?: string }) => {
    if (!toastCtx) return;
    if (typeof toastCtx === 'function') { toastCtx(payload); return; }
    if (toastCtx.push) { toastCtx.push(payload); return; }
    if (toastCtx.show) { toastCtx.show(payload); return; }
  }, [toastCtx]);

  // user select state
  const [trainer, setTrainer] = useState<{id:string;name?:string|null;email?:string|null} | null>(
    initial.trainerId ? ({ id: initial.trainerId, name: (initial as any).trainerName } as any) : null
  );
  const [client, setClient] = useState<{id:string;name?:string|null;email?:string|null} | null>(
    initial.clientId ? ({ id: initial.clientId, name: (initial as any).clientName } as any) : null
  );

  // “Zona do lixo” para arrastar e remover
  const binRef = useRef<HTMLDivElement | null>(null);

  const canSave = useMemo(() => {
    return trainerId && clientId && title.trim().length >= 3 && exercises.length > 0 && !busy;
  }, [trainerId, clientId, title, exercises.length, busy]);

  function addExercise(item: ExerciseLite) {
    setExercises((s) => [
      ...s,
      {
        id: item.id,
        name: item.name,
        mediaUrl: item.mediaUrl,
        muscleUrl: item.muscleUrl,
        sets: 3,
        reps: 10,
        notes: '',
      },
    ]);
    notify({ kind: 'success', message: `Adicionado: ${item.name}` });
  }

  const removeExercise = useCallback((idx: number) => {
    setExercises((s) => s.filter((_, i) => i !== idx));
  }, []);

  const moveExercise = useCallback((from: number, to: number) => {
    setExercises((s) => {
      const arr = s.slice();
      const [it] = arr.splice(from, 1);
      arr.splice(to, 0, it);
      return arr;
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
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

      notify({ kind: 'success', message: 'Plano guardado com sucesso!' });

      // callback ou navegação
      if (onSaved && id) onSaved(id);
      else router.push('/dashboard/pt');
    } catch (err: any) {
      notify({ kind: 'error', message: err?.message ?? 'Erro ao guardar o plano' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="grid gap-4">
      {/* Cabeçalho */}
      <div className="card" style={{ padding: 12 }}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs opacity-70">Título</label>
            <input
              className="h-10 rounded-lg border px-3"
              style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
              placeholder="Ex.: Plano Hipertrofia A/B"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs opacity-70">Estado</label>
            <select
              className="h-10 rounded-lg border px-3"
              style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <UserSelect
              label="Treinador"
              role="TRAINER"
              value={trainer}
              onChange={(v) => { setTrainer(v); setTrainerId(v?.id ?? initial.trainerId); }}
              placeholder="Pesquisar treinador…"
              disabled={!_admin}
            />

            <UserSelect
              label="Cliente"
              role="CLIENT"
              value={client}
              onChange={(v) => { setClient(v); setClientId(v?.id ?? initial.clientId); }}
              placeholder="Pesquisar cliente…"
            />
          </div>
        </div>

        <div className="grid gap-2 mt-3">
          <label className="text-xs opacity-70">Notas</label>
          <textarea
            className="min-h-[90px] rounded-lg border px-3 py-2"
            style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
            placeholder="Observações, indicações de carga, RIR, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Picker + Lista de exercícios */}
      <div className="grid gap-3 md:grid-cols-[360px,1fr]">
        <div className="card" style={{ padding: 12 }}>
          <ExercisePicker onPick={addExercise} />
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="m-0">Exercícios</h3>
            <div
              ref={binRef}
              title="Arrasta aqui para remover"
              className="rounded-lg border px-2 py-1 text-sm opacity-80"
              style={{ borderColor: 'var(--border)', background: 'var(--hover)' }}
            >
              🗑️ Remover
            </div>
          </div>

          {exercises.length === 0 ? (
            <div className="text-sm opacity-70">Ainda sem exercícios. Procura à esquerda e adiciona.</div>
          ) : (
            <div className="grid gap-2">
              {exercises.map((ex, idx) => (
                <div
                  key={`${ex.id}-${idx}`}
                  className="grid gap-3 rounded-xl border p-2 md:grid-cols-[64px,1fr,auto]"
                  style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    <Image
                      src={ex.mediaUrl || '/exercise-placeholder.png'}
                      alt=""
                      fill
                      sizes="64px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="text-sm font-semibold">{ex.name}</div>
                    <div className="grid gap-2 md:grid-cols-3">
                      <label className="grid gap-1 text-xs">
                        <span className="opacity-70">Séries</span>
                        <input
                          type="number"
                          min={1}
                          className="h-9 rounded-lg border px-2"
                          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
                          value={ex.sets ?? 3}
                          onChange={(e) =>
                            setExercises((s) => {
                              const clone = s.slice();
                              clone[idx] = { ...clone[idx], sets: Number(e.target.value) || 0 };
                              return clone;
                            })
                          }
                        />
                      </label>

                      <label className="grid gap-1 text-xs">
                        <span className="opacity-70">Repetições</span>
                        <input
                          type="number"
                          min={1}
                          className="h-9 rounded-lg border px-2"
                          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
                          value={ex.reps ?? 10}
                          onChange={(e) =>
                            setExercises((s) => {
                              const clone = s.slice();
                              clone[idx] = { ...clone[idx], reps: Number(e.target.value) || 0 };
                              return clone;
                            })
                          }
                        />
                      </label>

                      <label className="grid gap-1 text-xs md:col-span-1">
                        <span className="opacity-70">Notas</span>
                        <input
                          className="h-9 rounded-lg border px-2"
                          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
                          value={ex.notes ?? ''}
                          onChange={(e) =>
                            setExercises((s) => {
                              const clone = s.slice();
                              clone[idx] = { ...clone[idx], notes: e.target.value };
                              return clone;
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-center">
                    <button
                      type="button"
                      className="btn icon"
                      title="Mover para cima"
                      onClick={() => idx > 0 && moveExercise(idx, idx - 1)}
                    >
                      ⬆️
                    </button>
                    <button
                      type="button"
                      className="btn icon"
                      title="Mover para baixo"
                      onClick={() =>
                        idx < exercises.length - 1 && moveExercise(idx, idx + 1)
                      }
                    >
                      ⬇️
                    </button>
                    <button
                      type="button"
                      className="btn icon"
                      title="Remover"
                      onClick={() => removeExercise(idx)}
                    >
                      ✖
                    </button>
                  </div>

                  {/* preview de músculos (opcional) */}
                  {ex.muscleUrl && (
                    <div className="md:col-span-3">
                      <div className="relative mt-1 h-28 w-full overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                        <Image
                          src={ex.muscleUrl}
                          alt="Músculos trabalhados"
                          fill
                          sizes="100vw"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          className="btn primary"
          disabled={!canSave}
          title={!canSave ? 'Preenche os campos e adiciona exercícios' : 'Guardar'}
        >
          {busy ? 'A guardar…' : mode === 'create' ? 'Criar plano' : 'Guardar alterações'}
        </button>
      </div>
    </form>
  );
}
