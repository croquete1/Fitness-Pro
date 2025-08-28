'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';

type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
type Mode = 'create' | 'edit';

export type Exercise = {
  id?: string;
  name: string;
  sets?: number;
  reps?: string | number;
  rest?: string;
  weight?: string | number;
  notes?: string;
};

type InitialPlan = {
  id?: string;
  trainerId: string;
  clientId: string;
  title: string;
  notes: string | null;
  status: Status;
  exercises: Exercise[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function PlanEditor({
  mode,
  initial,
  onSaved,
}: {
  mode: Mode;
  initial: InitialPlan;
  onSaved?: (plan: any) => void;
}) {
  const { push } = useToast();

  const [title, setTitle] = useState(initial.title ?? '');
  const [status, setStatus] = useState<Status>(initial.status ?? 'ACTIVE');
  const [notes, setNotes] = useState<string>(initial.notes ?? '');
  const [exercises, setExercises] = useState<Exercise[]>(initial.exercises ?? []);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addExercise() {
    setExercises((xs) => [
      ...xs,
      { id: crypto.randomUUID(), name: '', sets: 3, reps: '10-12', rest: '60-90s', weight: '', notes: '' },
    ]);
  }
  function updateExercise(idx: number, patch: Partial<Exercise>) {
    setExercises((xs) => xs.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }
  function removeExercise(idx: number) {
    setExercises((xs) => xs.filter((_, i) => i !== idx));
  }

  const payload = useMemo(
    () => ({
      trainerId: initial.trainerId,
      clientId: initial.clientId,
      title,
      notes: notes || null,
      status,
      exercises,
    }),
    [initial.trainerId, initial.clientId, title, notes, status, exercises],
  );

  async function persist(showOkToast = true) {
    setSaving(true);
    setError(null);
    try {
      const url = mode === 'create' ? '/api/pt/plans' : `/api/pt/plans/${encodeURIComponent(String(initial.id))}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = j?.error || 'Falha a guardar';
        setError(msg);
        push({ text: msg, kind: 'err' });
        return;
      }
      setLastSavedAt(new Date());
      if (showOkToast) push({ text: mode === 'create' ? 'Plano criado' : 'Alterações guardadas' });

      // se for criação, atualiza URL para /edit
      if (mode === 'create' && j?.plan?.id) {
        history.replaceState(null, '', `/dashboard/pt/plans/${j.plan.id}/edit`);
      }
      onSaved?.(j.plan ?? j.data ?? null);
    } catch (e: any) {
      const msg = e?.message || 'Erro de rede';
      setError(msg);
      push({ text: msg, kind: 'err' });
    } finally {
      setSaving(false);
    }
  }

  // Auto-save (apenas 'edit')
  useEffect(() => {
    if (mode !== 'edit') return;
    const handle = setTimeout(() => { void persist(false); }, 900);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, title, notes, status, exercises]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Título</span>
          <input className="rounded-lg border p-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Peito e tríceps — Semana 1" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Estado</span>
          <select className="rounded-lg border p-2" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Notas do plano</span>
        <textarea className="rounded-lg border p-2 min-h-[90px]" value={notes ?? ''} onChange={(e) => setNotes(e.target.value)} placeholder="Notas gerais, foco técnico, RIR, etc." />
      </label>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Exercícios</h3>
        <button className="btn primary" onClick={addExercise}>+ Adicionar exercício</button>
      </div>

      <div className="grid gap-3">
        {exercises.map((ex, idx) => (
          <div key={ex.id ?? idx} className="rounded-xl border p-3">
            <div className="grid gap-2 md:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Nome</span>
                <input className="rounded-lg border p-2" value={ex.name} onChange={(e) => updateExercise(idx, { name: e.target.value })} placeholder="Supino inclinado com halteres" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Séries</span>
                <input className="rounded-lg border p-2" type="number" value={ex.sets ?? ''} onChange={(e) => updateExercise(idx, { sets: Number(e.target.value || 0) })} placeholder="3" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Reps</span>
                <input className="rounded-lg border p-2" value={ex.reps ?? ''} onChange={(e) => updateExercise(idx, { reps: e.target.value })} placeholder="8–10" />
              </label>
            </div>

            <div className="grid gap-2 md:grid-cols-3 mt-2">
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Descanso</span>
                <input className="rounded-lg border p-2" value={ex.rest ?? ''} onChange={(e) => updateExercise(idx, { rest: e.target.value })} placeholder="60–90s" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Peso (anotação)</span>
                <input className="rounded-lg border p-2" value={ex.weight ?? ''} onChange={(e) => updateExercise(idx, { weight: e.target.value })} placeholder="22.5kg" />
              </label>
            </div>

            <label className="grid gap-1 mt-2">
              <span className="text-sm text-gray-600">Notas do exercício</span>
              <textarea className="rounded-lg border p-2 min-h-[70px]" value={ex.notes ?? ''} onChange={(e) => updateExercise(idx, { notes: e.target.value })} placeholder="Amplitude controlada, 2s excêntrico, 1s pausa…" />
            </label>

            <div className="mt-2 flex justify-end">
              <button className="btn danger ghost" onClick={() => removeExercise(idx)}>Remover</button>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex items-center justify-end gap-2">
        <button className="btn" onClick={() => history.back()} disabled={saving}>Cancelar</button>
        <button className="btn primary" onClick={() => persist(true)} disabled={saving}>
          {saving ? 'A guardar…' : 'Guardar'}
        </button>
        <div className="text-xs text-gray-500">{lastSavedAt ? `Guardado às ${lastSavedAt.toLocaleTimeString()}` : '—'}</div>
      </div>
    </div>
  );
}
