/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Status } from '@prisma/client';
import ExercisePicker from '@/components/plan/ExercisePicker';
import UserSelect from '@/components/users/UserSelect';
import { useToast } from '@/components/ui/ToastProvider';

export type PlanExercise = {
  id?: string;
  exerciseId: string;
  name: string;
  mediaUrl?: string | null;
  muscleImageUrl?: string | null;
  primaryMuscle?: string | null;
  equipment?: string | null;
  sets?: number | null;
  reps?: string | number | null;
  load?: string | null;
  rest?: string | null;
  notes?: string | null;
  order?: number;
};

export type InitialPlan = {
  id?: string;
  trainerId: string;
  clientId?: string | null;
  title: string;
  notes: string;
  status: Status;
  exercises: PlanExercise[];
};

const TEMPLATES: Array<{ name: string; rows: Omit<PlanExercise, 'order'>[] }> = [
  {
    name: 'Full Body (iniciante)',
    rows: [
      { exerciseId: 'tpl-squat', name: 'Back Squat', sets: 3, reps: '8-10', rest: '90s', load: '', notes: '', primaryMuscle: 'Quadríceps', equipment: 'Barbell', mediaUrl: '', muscleImageUrl: '' },
      { exerciseId: 'tpl-bench', name: 'Bench Press', sets: 3, reps: '6-8',  rest: '120s', load: '', notes: '', primaryMuscle: 'Peito',      equipment: 'Barbell', mediaUrl: '', muscleImageUrl: '' },
      { exerciseId: 'tpl-row',   name: 'Seated Row',  sets: 3, reps: '10-12', rest: '90s',  load: '', notes: '', primaryMuscle: 'Dorsal',     equipment: 'Machine', mediaUrl: '', muscleImageUrl: '' },
    ],
  },
  {
    name: 'Push (peito/ombro/tríceps)',
    rows: [
      { exerciseId: 'tpl-incline', name: 'Incline DB Press', sets: 4, reps: '8-10', rest: '90s', load: '', notes: '', primaryMuscle: 'Peito',    equipment: 'Dumbbells', mediaUrl: '', muscleImageUrl: '' },
      { exerciseId: 'tpl-ohp',     name: 'Overhead Press',    sets: 4, reps: '6-8',  rest: '120s', load: '', notes: '', primaryMuscle: 'Ombros',  equipment: 'Barbell',   mediaUrl: '', muscleImageUrl: '' },
      { exerciseId: 'tpl-fly',     name: 'Cable Fly',         sets: 3, reps: '12-15',rest: '60s',  load: '', notes: '', primaryMuscle: 'Peito',    equipment: 'Cable',     mediaUrl: '', muscleImageUrl: '' },
    ],
  },
  {
    name: 'Pull (costas/bíceps)',
    rows: [
      { exerciseId: 'tpl-pulldown', name: 'Lat Pulldown', sets: 4, reps: '8-12', rest: '90s', load: '', notes: '', primaryMuscle: 'Dorsal', equipment: 'Cable', mediaUrl: '', muscleImageUrl: '' },
      { exerciseId: 'tpl-row2',     name: 'Bent-over Row', sets: 4, reps: '6-8', rest: '120s', load: '', notes: '', primaryMuscle: 'Dorsal', equipment: 'Barbell', mediaUrl: '', muscleImageUrl: '' },
      { exerciseId: 'tpl-curl',     name: 'EZ-Bar Curl',  sets: 3, reps: '10-12', rest: '60s', load: '', notes: '', primaryMuscle: 'Bíceps', equipment: 'EZ Bar', mediaUrl: '', muscleImageUrl: '' },
    ],
  },
];

export default function PlanEditor({
  mode,
  initial,
  admin,
}: {
  mode: 'create' | 'edit';
  initial: InitialPlan;
  admin?: boolean;
}) {
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

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
  const [saving, setSaving] = useState(false);

  // pickers/modals
  const [pickerOpen, setPickerOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Drag & Drop
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const canSave = useMemo(() => title.trim().length >= 2 && !!trainerId, [title, trainerId]);

  function addExercise(ex: { id: string; name: string; media_url?: string | null; muscle_image_url?: string | null; primary_muscle?: string | null; equipment?: string | null; }) {
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
    info('Exercício adicionado');
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

  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    const templ = t.rows.map((r, i) => ({ ...r, order: i }));
    setRows(templ);
    setTemplatesOpen(false);
    info(`Template “${t.name}” aplicado`);
  }

  // Drag handlers
  function onDragStart(e: React.DragEvent, i: number) {
    setDragIdx(i);
    e.dataTransfer.setData('text/plain', String(i));
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIdx(i);
  }
  function onDrop(e: React.DragEvent, i: number) {
    e.preventDefault();
    const from = dragIdx ?? Number(e.dataTransfer.getData('text/plain') || -1);
    const to = i;
    setDragIdx(null);
    setOverIdx(null);
    if (from < 0 || from === to) return;

    setRows((prev) => {
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next.map((r, idx) => ({ ...r, order: idx }));
    });
  }
  function onDragEnd() {
    setDragIdx(null);
    setOverIdx(null);
  }

  async function onSave() {
    if (!canSave || saving) return;

    const exercisesPayload = rows.map((row) => {
      const { id: _omit, ...r } = row;
      return r;
    });

    const payload = {
      trainerId,
      clientId: clientId || null,
      title: title.trim(),
      notes: notes ?? '',
      status,
      exercises: exercisesPayload,
    };

    try {
      setSaving(true);
      const res = await fetch(
        mode === 'create' ? '/api/pt/plans' : `/api/pt/plans/${initial.id}`,
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const j = await res.json();
      success(mode === 'create' ? 'Plano criado.' : 'Alterações guardadas.');

      if (mode === 'create') {
        router.replace(`/dashboard/pt/plans/${j.plan?.id || j.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (e: any) {
      console.error(e);
      toastError('Não foi possível guardar o plano', { message: e?.message?.slice(0, 160) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3">
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

            <div className="flex items-center gap-2">
              <button className="btn chip" type="button" onClick={() => setTemplatesOpen(true)}>Templates</button>
              <button className="btn chip" type="button" onClick={() => setPickerOpen(true)}>+ Adicionar exercício</button>
              <button className="btn chip" type="button" onClick={() => setPreviewOpen(true)}>Pré-visualizar</button>
            </div>

            <button className="btn primary" disabled={!canSave || saving} onClick={onSave}>
              {saving ? 'A guardar…' : mode === 'create' ? 'Criar plano' : 'Guardar alterações'}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, width: 32 }} />
              <th style={{ textAlign: 'left', padding: 8 }}>Exercício</th>
              <th style={{ textAlign: 'left', padding: 8, width: 90 }}>Séries</th>
              <th style={{ textAlign: 'left', padding: 8, width: 120 }}>Reps</th>
              <th style={{ textAlign: 'left', padding: 8, width: 120 }}>Carga</th>
              <th style={{ textAlign: 'left', padding: 8, width: 110 }}>Descanso</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Notas</th>
              <th style={{ width: 160 }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 12 }}>
                  <div className="text-muted">Ainda sem exercícios — usa “Adicionar exercício” ou “Templates”.</div>
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={`${r.exerciseId}-${i}`}
                  style={{
                    borderTop: '1px solid var(--border)',
                    background: overIdx === i ? 'var(--hover)' : 'transparent',
                  }}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDrop={(e) => onDrop(e, i)}
                >
                  <td style={{ padding: 8 }}>
                    <button
                      className="btn chip"
                      draggable
                      onDragStart={(e) => onDragStart(e, i)}
                      onDragEnd={onDragEnd}
                      title="Arrastar para reordenar"
                      type="button"
                    >
                      ↕
                    </button>
                  </td>
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
                      <button className="btn chip" type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                      <button className="btn chip" type="button" onClick={() => move(i, +1)} disabled={i === rows.length - 1}>↓</button>
                      <button className="btn chip" type="button" onClick={() => removeRow(i)}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Exercise Picker */}
      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addExercise}
      />

      {/* Templates (popover simples) */}
      {templatesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] grid place-items-center bg-black/30 p-4"
          onClick={(e) => e.currentTarget === e.target && setTemplatesOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl border bg-white p-4 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Templates rápidos</h3>
            <div className="grid gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.name} className="btn" onClick={() => applyTemplate(t)}>{t.name}</button>
              ))}
            </div>
            <div className="mt-3 text-right">
              <button className="btn ghost" onClick={() => setTemplatesOpen(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] grid place-items-center bg-black/30 p-4"
          onClick={(e) => e.currentTarget === e.target && setPreviewOpen(false)}
        >
          <div className="w-full max-w-3xl rounded-2xl border bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold m-0">Pré-visualização</h3>
              <button className="btn ghost" onClick={() => setPreviewOpen(false)}>Fechar</button>
            </div>
            <div className="mt-3">
              <div className="mb-2">
                <div className="text-xl font-bold">{title || 'Plano sem título'}</div>
                <div className="text-sm opacity-75">{notes || '—'}</div>
                <div className="mt-1 text-xs"><span className="chip">Status: {status}</span></div>
              </div>
              <div className="grid gap-2">
                {rows.length === 0 ? (
                  <div className="text-muted">Ainda sem exercícios.</div>
                ) : (
                  rows.map((r, i) => (
                    <div key={`${r.exerciseId}-${i}`} className="rounded-xl border p-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-[96px] h-[56px] rounded-lg overflow-hidden border bg-[var(--hover)] grid place-items-center">
                          {r.mediaUrl ? (
                            <img src={r.mediaUrl} alt={r.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          ) : <span className="text-xs opacity-60">sem media</span>}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{i + 1}. {r.name}</div>
                          <div className="text-xs opacity-70">
                            {r.primaryMuscle || '—'} {r.equipment ? `• ${r.equipment}` : ''}
                          </div>
                          <div className="text-sm mt-1">
                            <span className="chip">Séries: {r.sets ?? '—'}</span>{' '}
                            <span className="chip">Reps: {r.reps ?? '—'}</span>{' '}
                            <span className="chip">Descanso: {r.rest ?? '—'}</span>{' '}
                            {r.load ? <span className="chip">Carga: {r.load}</span> : null}
                          </div>
                          {r.notes ? <div className="text-xs mt-1 opacity-80">Notas: {r.notes}</div> : null}
                        </div>
                        {r.muscleImageUrl ? (
                          <div className="hidden md:block w-[120px] h-[72px] rounded-lg overflow-hidden border bg-[var(--hover)]">
                            <img src={r.muscleImageUrl} alt="Músculos" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
