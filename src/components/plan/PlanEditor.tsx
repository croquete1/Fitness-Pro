'use client';
import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
// Se tiveres estes componentes no teu projeto:
import UserSelect from '@/components/users/UserSelect';
import ExercisePicker from '@/components/plan/ExercisePicker';

type PlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | string;

export type InitialPlan = {
  id?: string;
  trainerId: string;
  clientId: string;
  title: string;
  notes: string;
  status: PlanStatus;
  exercises: any[];
};

type Props = {
  mode: 'create' | 'edit';
  admin?: boolean;
  initial: InitialPlan;
  onSaved?: (planId: string) => void;
};

type Template = {
  id: string; name: string; tags: string[];
  // para exemplo simples: dias com “exercícios” placeholders (o PT pode depois trocar no picker)
  days: Array<{ day: number; items: Array<{ name: string; sets?: number; reps?: string }> }>;
};

const TEMPLATES: Template[] = [
  {
    id: 'hipertrofia-4',
    name: 'Hipertrofia — 4 dias',
    tags: ['hipertrofia','4 dias'],
    days: [
      { day: 1, items: [{ name: 'Supino reto', sets: 4, reps: '8-10' }, { name: 'Remada curvada', sets: 4, reps: '8-10' }] },
      { day: 2, items: [{ name: 'Agachamento', sets: 4, reps: '6-8' }, { name: 'Leg press', sets: 3, reps: '10-12' }] },
      { day: 3, items: [{ name: 'Desenvolvimento ombro', sets: 4, reps: '8-10' }, { name: 'Elevação lateral', sets: 3, reps: '12-15' }] },
      { day: 4, items: [{ name: 'Terra romeno', sets: 4, reps: '6-8' }, { name: 'Gêmeos em pé', sets: 4, reps: '12-15' }] },
    ],
  },
  {
    id: 'corte-3',
    name: 'Cut — 3 dias (full-body)',
    tags: ['cut','3 dias','full-body'],
    days: [
      { day: 1, items: [{ name: 'Agachamento', sets: 3, reps: '10' }, { name: 'Supino inclinado', sets: 3, reps: '10' }] },
      { day: 2, items: [{ name: 'Levantamento terra', sets: 3, reps: '8' }, { name: 'Barra fixa', sets: 3, reps: 'amrap' }] },
      { day: 3, items: [{ name: 'Press militar', sets: 3, reps: '10' }, { name: 'Afundos paralelas', sets: 3, reps: 'amrap' }] },
    ],
  },
];

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity=".2" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none" />
    </svg>
  );
}

export default function PlanEditor({ mode, admin, initial, onSaved }: Props) {
  const router = useRouter();
  const { push } = useToast();

  const [trainerId, setTrainerId] = useState(initial.trainerId);
  const [clientId, setClientId]   = useState(initial.clientId);
  const [title, setTitle]         = useState(initial.title ?? '');
  const [notes, setNotes]         = useState(initial.notes ?? '');
  const [status, setStatus]       = useState<PlanStatus>(initial.status ?? 'DRAFT');
  const [exercises, setExercises] = useState<any[]>(initial.exercises ?? []);
  const [saving, setSaving]       = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // “Zona do lixo” para arrastar e remover
  const binRef = useRef<HTMLDivElement | null>(null);

  function addExercise(item: any) {
    setExercises((s) => [...s, { ...item }]);
  }
  function removeExercise(idx: number) {
    setExercises(s => s.filter((_, i) => i !== idx));
  }

  // Reorder: acessível (setas) + drag & drop nativo
  function moveUp(idx: number) {
    if (idx <= 0) return;
    setExercises(s => {
      const arr = [...s]; const t = arr[idx-1]; arr[idx-1] = arr[idx]; arr[idx] = t; return arr;
    });
  }
  function moveDown(idx: number) {
    setExercises(s => {
      if (idx >= s.length - 1) return s;
      const arr = [...s]; const t = arr[idx+1]; arr[idx+1] = arr[idx]; arr[idx] = t; return arr;
    });
  }

  // Drag handlers
  function onDragStart(e: React.DragEvent, idx: number) {
    setDraggingIndex(idx);
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOverRow(e: React.DragEvent, overIdx: number) {
    e.preventDefault();
    const from = draggingIndex;
    if (from == null || from === overIdx) return;
    // reorder live enquanto arrastas
    setExercises(s => {
      const arr = [...s];
      const [moved] = arr.splice(from, 1);
      arr.splice(overIdx, 0, moved);
      return arr;
    });
    setDraggingIndex(overIdx);
  }
  function onDragEnd() {
    setDraggingIndex(null);
  }

  // Drop no “lixo” para remover
  function onDragOverBin(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDropBin(e: React.DragEvent) {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isFinite(from)) removeExercise(from);
    setDraggingIndex(null);
  }

  // Aplicar template
  function applyTemplate(t: Template) {
    // Mantém trainer/client/title; substitui exercícios e notas
    const templNotes = `Template: ${t.name} (${t.tags.join(', ')})`;
    const templItems = t.days.flatMap(d =>
      d.items.map(it => ({
        name: it.name, sets: it.sets ?? 3, reps: it.reps ?? '10-12', day: d.day
      }))
    );
    setNotes(n => (n ? n + '\n\n' : '') + templNotes);
    setExercises(templItems);
    push({ message: `Modelo “${t.name}” aplicado.` });
  }

  async function onSave() {
    if (!trainerId || !clientId) {
      push({ message: 'Seleciona Treinador e Cliente antes de guardar.' });
      return;
    }
    setSaving(true);
    try {
      const payload = { trainerId, clientId, title, notes, status, exercises };
      const res = await fetch(
        mode === 'edit' && initial.id ? `/api/pt/plans/${initial.id}` : '/api/pt/plans',
        { method: mode === 'edit' ? 'PATCH' : 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const planId = data?.plan?.id ?? initial.id;

      push({
        message: 'Plano guardado.',
        actionLabel: 'Abrir',
        onAction: () => router.push(`/dashboard/pt/plans/${planId}/edit`)
      });

      onSaved?.(planId);
      router.refresh();
    } catch (e) {
      push({ message: 'Falha ao guardar o plano.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3">
      {/* Linha superior: selects + título/status + templates */}
      <div className="card" style={{ padding: 12 }}>
        <div className="grid" style={{ gap: 8 }}>
          <div className="grid" style={{ gridTemplateColumns: admin ? '1fr 1fr' : '1fr', gap: 8 }}>
            {admin && (
              <>
                <div>
                  <label className="block text-xs opacity-70 mb-1">Treinador</label>
                  <UserSelect role="TRAINER" value={trainerId} onChange={setTrainerId} placeholder="Escolher PT…" />
                </div>
                <div>
                  <label className="block text-xs opacity-70 mb-1">Cliente</label>
                  <UserSelect role="CLIENT" value={clientId} onChange={setClientId} placeholder="Escolher cliente…" />
                </div>
              </>
            )}
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 180px 200px', gap: 8 }}>
            <div>
              <label className="block text-xs opacity-70 mb-1">Título</label>
              <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: ABC 4x/semana" />
            </div>
            <div>
              <label className="block text-xs opacity-70 mb-1">Estado</label>
              <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="DRAFT">Rascunho</option>
                <option value="ACTIVE">Ativo</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs opacity-70 mb-1">Modelos</label>
              <div className="flex gap-2">
                <select className="input" onChange={(e) => {
                  const t = TEMPLATES.find(x => x.id === e.target.value);
                  if (t) applyTemplate(t);
                }}>
                  <option value="">— Escolhe um —</option>
                  {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs opacity-70 mb-1">Notas</label>
            <textarea className="input" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Diretrizes, RPE, observações…" />
          </div>

          <div className="flex items-center gap-8">
            <ExercisePicker onPick={addExercise} />
            <button className="btn primary" onClick={onSave} disabled={saving}>
              {saving ? (<><Spinner />&nbsp;A guardar…</>) : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de exercícios */}
      <div className="card" style={{ padding: 12 }}>
        <div className="flex items-center justify-between mb-2">
          <h3 style={{ margin: 0 }}>Exercícios</h3>
          <div ref={binRef}
               onDragOver={onDragOverBin}
               onDrop={onDropBin}
               className="btn"
               title="Arrasta aqui para remover"
               style={{ background:'var(--hover)' }}>
            🗑️ Remover por arrastar
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="text-muted">Ainda não adicionaste exercícios.</div>
        ) : (
          <ul className="grid" style={{ gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
            {exercises.map((ex, i) => (
              <li key={i}
                  draggable
                  onDragStart={(e)=>onDragStart(e, i)}
                  onDragOver={(e)=>onDragOverRow(e, i)}
                  onDragEnd={onDragEnd}
                  className="grid"
                  style={{ gridTemplateColumns:'1fr auto', gap:8, border:'1px solid var(--border)', borderRadius:12, padding:8, background:'var(--card-bg)'}}>
                <div>
                  <div className="font-semibold">{ex.name ?? `Exercício #${i+1}`}</div>
                  <div className="text-sm opacity-80">
                    {ex.sets ? `${ex.sets} séries` : null}
                    {ex.reps ? ` · ${ex.reps} reps` : null}
                    {typeof ex.day === 'number' ? ` · Dia ${ex.day}` : null}
                  </div>
                </div>
                <div className="table-actions">
                  <button className="btn chip" onClick={()=>moveUp(i)} aria-label="Mover para cima">↑</button>
                  <button className="btn chip" onClick={()=>moveDown(i)} aria-label="Mover para baixo">↓</button>
                  <button className="btn chip" onClick={()=>removeExercise(i)} aria-label="Remover">Remover</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
