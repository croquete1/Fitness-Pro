'use client';

import { useState } from 'react';

type Exercise = {
  id?: string;
  name: string;
  sets?: number;
  reps?: string;   // ex: "8–12"
  weight?: string; // ex: "20 kg" ou "RPE 8"
  notes?: string;
};

type PlanEditorProps = {
  initial?: Partial<{
    title: string;
    notes: string;
    status: string; // ACTIVE | DRAFT | SUSPENDED | DELETED …
    exercises: Exercise[];
  }>;
  trainerId?: string;
  clientId?: string;

  saveUrl?: string;                  // opcional: o componente faz o fetch
  method?: 'POST' | 'PUT' | 'PATCH';
  onSubmit?: (data: any) => Promise<void> | void; // alternativa manual
} & Record<string, any>;

export default function PlanEditor({
  initial,
  trainerId,
  clientId,
  saveUrl,
  method,
  onSubmit,
  ...rest
}: PlanEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'ACTIVE');
  const [exercises, setExercises] = useState<Exercise[]>(
    initial?.exercises?.length ? initial.exercises : [{ name: '', sets: 3, reps: '10', weight: '', notes: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function updateExercise(i: number, patch: Partial<Exercise>) {
    setExercises((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function addExercise() {
    setExercises((prev) => [...prev, { name: '', sets: 3, reps: '10', weight: '', notes: '' }]);
  }
  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(false);

    const payload = {
      trainerId: trainerId ?? null,
      clientId: clientId ?? null,
      title,
      notes: notes || null,
      status,
      exercises,
    };

    try {
      if (saveUrl) {
        const res = await fetch(saveUrl, {
          method: method ?? (initial ? 'PATCH' : 'POST'),
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
      } else if (onSubmit) {
        await onSubmit(payload);
      } else {
        console.warn('[PlanEditor] Nenhum saveUrl/onSubmit fornecido:', payload);
      }
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} {...rest}>
      <div className="grid gap-4" style={{ maxWidth: 900 }}>
        <div className="grid gap-1">
          <label className="text-sm text-gray-600">Título do plano</label>
          <input
            className="rounded-lg border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Hipertrofia Full-Body"
            required
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-gray-600">Notas gerais do plano</label>
          <textarea
            className="rounded-lg border p-2"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações gerais, recomendações, etc."
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-gray-600">Estado</label>
          <select
            className="rounded-lg border p-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="DELETED">DELETED</option>
          </select>
        </div>

        <div className="grid gap-2">
          <div className="text-sm text-gray-600">Exercícios</div>
          {exercises.map((ex, i) => (
            <div key={i} className="grid gap-2 rounded-xl border p-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="rounded-lg border p-2"
                  placeholder="Ex.: Agachamento livre"
                  value={ex.name}
                  onChange={(e) => updateExercise(i, { name: e.target.value })}
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="rounded-lg border p-2"
                    type="number"
                    min={1}
                    placeholder="Séries"
                    value={ex.sets ?? ''}
                    onChange={(e) => updateExercise(i, { sets: parseInt(e.target.value || '0', 10) })}
                  />
                  <input
                    className="rounded-lg border p-2"
                    placeholder="Reps (ex.: 8–12)"
                    value={ex.reps ?? ''}
                    onChange={(e) => updateExercise(i, { reps: e.target.value })}
                  />
                  <input
                    className="rounded-lg border p-2"
                    placeholder="Peso/RPE"
                    value={ex.weight ?? ''}
                    onChange={(e) => updateExercise(i, { weight: e.target.value })}
                  />
                </div>
              </div>
              <textarea
                className="rounded-lg border p-2"
                rows={2}
                placeholder="Notas do exercício (técnica, tempo, progressão, etc.)"
                value={ex.notes ?? ''}
                onChange={(e) => updateExercise(i, { notes: e.target.value })}
              />
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="btn icon"
                  onClick={() => removeExercise(i)}
                  aria-label="Remover exercício"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          <div>
            <button type="button" className="btn" onClick={addExercise}>
              + Adicionar exercício
            </button>
          </div>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        {ok && <p className="text-sm text-green-600">Plano guardado com sucesso.</p>}

        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            className="rounded-lg border bg-black/90 px-3 py-2 text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'A guardar…' : initial ? 'Atualizar plano' : 'Criar plano'}
          </button>
        </div>
      </div>
    </form>
  );
}
