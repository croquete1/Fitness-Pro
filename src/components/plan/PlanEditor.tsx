// src/components/plans/PlanEditor.tsx
'use client';

import { useMemo, useState, useTransition } from 'react';
import ToastHost from '@/components/ui/ToastHost';
import { useRouter } from 'next/navigation';

type Exercise = {
  id?: string;
  name?: string;
  sets?: number;
  reps?: string | number;
  weight?: string | number;
  tempo?: string;
  rest?: string;
  notes?: string;
};

type Plan = {
  id: string;
  title: string;
  notes: string | null;
  exercises: Exercise[];
  status: string;
  trainerId: string | null;
  clientId: string | null;
};

export default function PlanEditor({ initialPlan }: { initialPlan: Plan }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPlan.title ?? '');
  const [notes, setNotes] = useState(initialPlan.notes ?? '');
  const [status, setStatus] = useState(initialPlan.status ?? 'ACTIVE');
  const [exs, setExs] = useState<Exercise[]>(Array.isArray(initialPlan.exercises) ? initialPlan.exercises : []);
  const [saving, setSaving] = useState(false);
  const [toastOk, setToastOk] = useState<string>();
  const [toastErr, setToastErr] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const empty = useMemo(() => exs.length === 0, [exs.length]);

  function addExercise() {
    setExs((arr) => [...arr, { name: '', sets: 3, reps: '10-12', weight: '', tempo: '', rest: '60s', notes: '' }]);
  }
  function removeExercise(i: number) {
    setExs((arr) => arr.filter((_, idx) => idx !== i));
  }
  function moveExercise(i: number, dir: -1 | 1) {
    setExs((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const clone = arr.slice();
      const tmp = clone[i]; clone[i] = clone[j]; clone[j] = tmp;
      return clone;
    });
  }
  function patchExercise(i: number, field: keyof Exercise, value: any) {
    setExs((arr) => arr.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
  }

  async function onSave() {
    setSaving(true); setToastErr(undefined); setToastOk(undefined);
    try {
      const res = await fetch(`/api/sb/plans/${initialPlan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, notes, status, exercises: exs }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Falha ao guardar');
      setToastOk('Alterações guardadas com sucesso.');
      // refresh da página de leitura
      startTransition(() => router.replace(`/dashboard/pt/plans/${initialPlan.id}?saved=1`));
    } catch (e: any) {
      setToastErr(e?.message || 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
      <ToastHost success={toastOk} error={toastErr} />

      {/* Cabeçalho / estado */}
      <div className="grid md:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Título</span>
          <input
            className="rounded-lg border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Push/Pull/Legs — Bloco A"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Estado</span>
          <select className="rounded-lg border p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="DELETED">DELETED</option>
          </select>
        </label>
      </div>

      {/* Notas do plano */}
      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Notas do plano</span>
        <textarea
          className="rounded-lg border p-2 min-h-[100px]"
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações gerais, frequência semanal, RPE alvo, etc."
        />
      </label>

      {/* Exercícios */}
      <div className="card" style={{ padding: 12 }}>
        <div className="flex items-center justify-between">
          <div className="text-muted">Exercícios</div>
          <button className="btn chip" onClick={addExercise} type="button">+ Adicionar exercício</button>
        </div>

        {empty ? (
          <div className="mt-3 flex items-center gap-2 text-gray-600">
            <span style={{ fontSize: 18 }}>🗒️</span>
            Ainda não existem exercícios neste plano.
          </div>
        ) : (
          <div className="mt-3 grid gap-3">
            {exs.map((ex, i) => (
              <div key={i} className="rounded-xl border p-3 grid gap-3">
                <div className="flex items-center justify-between">
                  <strong className="text-sm">Exercício #{i + 1}</strong>
                  <div className="flex items-center gap-2">
                    <button className="btn chip" type="button" onClick={() => moveExercise(i, -1)} aria-label="Mover acima">↑</button>
                    <button className="btn chip" type="button" onClick={() => moveExercise(i, +1)} aria-label="Mover abaixo">↓</button>
                    <button className="btn chip" type="button" onClick={() => removeExercise(i)} aria-label="Remover">Remover</button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Nome</span>
                    <input className="rounded-lg border p-2" value={ex.name ?? ''} onChange={(e) => patchExercise(i, 'name', e.target.value)} placeholder="Supino inclinado com barra" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Séries</span>
                    <input className="rounded-lg border p-2" type="number" min={1}
                      value={Number(ex.sets ?? 3)}
                      onChange={(e) => patchExercise(i, 'sets', Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Reps</span>
                    <input className="rounded-lg border p-2" value={String(ex.reps ?? '')}
                      onChange={(e) => patchExercise(i, 'reps', e.target.value)} placeholder="8-10"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Peso</span>
                    <input className="rounded-lg border p-2" value={String(ex.weight ?? '')}
                      onChange={(e) => patchExercise(i, 'weight', e.target.value)} placeholder="30 kg / 70%"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Tempo</span>
                    <input className="rounded-lg border p-2" value={ex.tempo ?? ''} onChange={(e) => patchExercise(i, 'tempo', e.target.value)} placeholder="3-1-1-0" />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Descanso</span>
                    <input className="rounded-lg border p-2" value={ex.rest ?? ''} onChange={(e) => patchExercise(i, 'rest', e.target.value)} placeholder="90s" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Notas do exercício</span>
                    <input className="rounded-lg border p-2" value={ex.notes ?? ''} onChange={(e) => patchExercise(i, 'notes', e.target.value)} placeholder="Cotovelo junto ao tronco; manter escápulas." />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="btn chip" type="button" onClick={() => history.back()} disabled={saving || isPending}>Cancelar</button>
        <button
          className="rounded-lg border bg-black/90 px-3 py-2 text-white disabled:opacity-60"
          type="button"
          onClick={onSave}
          disabled={saving || isPending}
        >
          {saving ? 'A guardar…' : 'Guardar alterações'}
        </button>
      </div>
    </div>
  );
}
