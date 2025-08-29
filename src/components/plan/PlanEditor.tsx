'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Status } from '@prisma/client';
import ExercisePicker, { ExerciseLite } from './ExercisePicker';
import UserSelect from '@/components/users/UserSelect';

export type PlanExercise = {
  id?: string;               // id da linha (se existir no backend)
  exerciseId: string;        // id do exercício (foreign key)
  name: string;
  mediaUrl?: string | null;
  muscleImageUrl?: string | null;
  primaryMuscle?: string | null;
  equipment?: string | null;

  // parâmetros de treino
  sets?: number | null;
  reps?: string | number | null;  // "12", "8-10"
  load?: string | null;           // "40kg", "RPE 8"
  rest?: string | null;           // "60s"
  notes?: string | null;

  order?: number;
};

export type InitialPlan = {
  id?: string;
  trainerId: string;
  clientId?: string | null;
  title: string;
  notes: string;
  status: Status;           // manter Status (enum Prisma)
  exercises: PlanExercise[]; // array serializável
};

export default function PlanEditor({
  mode,                 // 'create' | 'edit'
  initial,
  admin,                // se true, mostra selects de treinador/cliente
}: {
  mode: 'create' | 'edit';
  initial: InitialPlan;
  admin?: boolean;
}) {
  const router = useRouter();

  // normaliza status (em caso de vir string simples do fetch)
  const [status, setStatus] = useState<Status>(() => (initial?.status ?? 'ACTIVE') as Status);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [trainerId, setTrainerId] = useState<string>(initial?.trainerId || '');
  const [clientId, setClientId] = useState<string>(initial?.clientId || '');

  const [rows, setRows] = useState<PlanExercise[]>(
    (initial?.exercises ?? []).map((r, i) => ({
      ...r,
      mediaUrl: r.mediaUrl ?? (r as any).media_url ?? null,
      muscleImageUrl: r.muscleImageUrl ?? (r as any).muscle_image_url ?? null,
      order: r.order ?? i,
    }))
  );

  // picker
  const [pickerOpen, setPickerOpen] = useState(false);

  const canSave = useMemo(() => {
    return title.trim().length >= 2 && trainerId;
  }, [title, trainerId]);

  function addExercise(ex: ExerciseLite) {
    setRows((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        name: ex.name,
        mediaUrl: ex.media_url || null,
        muscleImageUrl: ex.muscle_image_url || null,
        primaryMuscle: ex.primary_muscle || null,
        equipment: ex.equipment || null,
        sets: 3,
        reps: '10-12',
        rest: '60-90s',
        load: null,
        notes: null,
        order: prev.length,
      },
    ]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, order: i })));
  }

  function move(idx: number, dir: -1 | 1) {
    setRows((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      const [a, b] = [next[idx], next[j]];
      next[idx] = { ...b, order: idx };
      next[j] = { ...a, order: j };
      return next;
    });
  }

  function update(idx: number, patch: Partial<PlanExercise>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  async function onSave() {
    if (!canSave) return;
    const payload = {
      trainerId,
      clientId: clientId || null,
      title: title.trim(),
      notes: notes ?? '',
      status,
      exercises: rows.map(({ id, ...r }) => r), // enviar sem id local
    };

    try {
      const res = await fetch(
        mode === 'create'
          ? '/api/pt/plans'                 // POST cria
          : `/api/pt/plans/${initial.id}`, // PATCH edita
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const j = await res.json();

      // navega para o editor (ou recarrega)
      if (mode === 'create') {
        router.replace(`/dashboard/pt/plans/${j.plan?.id || j.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert('Não foi possível guardar o plano.');
    }
  }

  return (
    <div className="grid gap-3">
      {/* Cabeçalho */}
      <div className="card" style={{ padding: 12 }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr auto', gap: 12 }}>
          <div className="grid gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do plano (ex.: Hipertrofia — 4 dias)"
              className="input"
              style={{ height: 40, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)' }}
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas gerais (progressão, RPE, dias/semana, etc.)"
              rows={3}
              className="input"
              style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--btn-bg)', color: 'var(--text)' }}
            />
            <div className="flex items-center gap-8">
              <label className="text-sm opacity-75">
                Estado:{' '}
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  className="input"
                  style={{ height: 34, border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', background: 'var(--btn-bg)', color: 'var(--text)' }}
                >
                  <option value={Status.ACTIVE}>ACTIVE</option>
                  <option value={Status.PENDING}>PENDING</option>
                  <option value={Status.SUSPENDED}>SUSPENDED</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-2 content-start">
            {admin && (
              <>
                <UserSelect
                  label="Treinador"
                  role="TRAINER"
                  value={trainerId}
                  onChange={(id) => setTrainerId(id || '')}
                  placeholder="Escolhe o treinador…"
                />
                <UserSelect
                  label="Cliente (opcional)"
                  role="CLIENT"
                  value={clientId || ''}
                  onChange={(id) => setClientId(id || '')}
                  placeholder="Escolhe o cliente…"
                />
              </>
            )}
            <button className="btn primary" disabled={!canSave} onClick={onSave}>
              {mode === 'create' ? 'Criar plano' : 'Guardar alterações'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de exercícios */}
      <div className="card" style={{ padding: 12 }}>
        <div className="flex items-center justify-between mb-2">
          <h3 style={{ margin: 0 }}>Exercícios</h3>
          <button className="btn chip" onClick={() => setPickerOpen(true)}>+ Adicionar exercício</button>
        </div>

        {rows.length === 0 ? (
          <div className="text-muted">Ainda sem exercícios — usa “Adicionar exercício”.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>#</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Exercício</th>
                <th style={{ textAlign: 'left', padding: 8, width: 90 }}>Séries</th>
                <th style={{ textAlign: 'left', padding: 8, width: 120 }}>Reps</th>
                <th style={{ textAlign: 'left', padding: 8, width: 120 }}>Carga</th>
                <th style={{ textAlign: 'left', padding: 8, width: 110 }}>Descanso</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Notas</th>
                <th style={{ width: 140 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.exerciseId}-${i}`} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{i + 1}</td>
                  <td style={{ padding: 8 }}>
                    <div className="flex items-center gap-2">
                      <div className="w-[72px] h-[40px] rounded-lg overflow-hidden border bg-[var(--hover)] grid place-items-center">
                        {r.mediaUrl ? (
                          <img src={r.mediaUrl} alt={r.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : <span className="text-xs opacity-60">sem media</span>}
                      </div>
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs opacity-70">{r.primaryMuscle || '—'} {r.equipment ? `• ${r.equipment}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      min={1}
                      value={r.sets ?? 3}
                      onChange={(e) => update(i, { sets: Number(e.target.value) || 0 })}
                      className="input"
                      style={{ width: 80, height: 34, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', background: 'var(--btn-bg)', color: 'var(--text)' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={String(r.reps ?? '')}
                      onChange={(e) => update(i, { reps: e.target.value })}
                      placeholder="10-12"
                      className="input"
                      style={{ width: 110, height: 34, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', background: 'var(--btn-bg)', color: 'var(--text)' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={r.load ?? ''}
                      onChange={(e) => update(i, { load: e.target.value })}
                      placeholder="40kg / RPE 8"
                      className="input"
                      style={{ width: 110, height: 34, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', background: 'var(--btn-bg)', color: 'var(--text)' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={r.rest ?? ''}
                      onChange={(e) => update(i, { rest: e.target.value })}
                      placeholder="60-90s"
                      className="input"
                      style={{ width: 100, height: 34, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', background: 'var(--btn-bg)', color: 'var(--text)' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={r.notes ?? ''}
                      onChange={(e) => update(i, { notes: e.target.value })}
                      placeholder="Notas…"
                      className="input"
                      style={{ width: '100%', height: 34, border: '1px solid var(--border)', borderRadius: 8, padding: '0 8px', background: 'var(--btn-bg)', color: 'var(--text)' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <div className="table-actions">
                      <button className="btn chip" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                      <button className="btn chip" onClick={() => move(i, +1)} disabled={i === rows.length - 1}>↓</button>
                      <button className="btn chip" onClick={() => removeRow(i)}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Picker modal */}
      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addExercise}
      />
    </div>
  );
}
