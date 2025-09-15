'use client';

import React from 'react';

export type Exercise = {
  id: string;
  name: string;
  notes?: string | null;
};

export type DayWithExercises = {
  dayId: string;
  title: string;
  exercises: Exercise[];
};

type Props = {
  planId: string;
  initialTitle: string;
  initialStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  initialDays: DayWithExercises[];
  className?: string;
};

export default function PlanEditorDnD({
  planId,
  initialTitle,
  initialStatus,
  initialDays,
  className = '',
}: Props) {
  const [title, setTitle] = React.useState(initialTitle);
  const [status, setStatus] = React.useState<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>(initialStatus);
  const [days, setDays] = React.useState<DayWithExercises[]>(initialDays);
  const [dragDay, setDragDay] = React.useState<string | null>(null);
  const [dragExercise, setDragExercise] = React.useState<{ dayId: string; exId: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // ======== helpers
  function reorder<T>(arr: T[], from: number, to: number): T[] {
    const copy = arr.slice();
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  }

  // ======== DnD dias
  function onDayDragStart(e: React.DragEvent<HTMLDivElement>, dayId: string) {
    setDragDay(dayId);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDayDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  async function onDayDrop(e: React.DragEvent<HTMLDivElement>, targetDayId: string) {
    e.preventDefault();
    const source = dragDay;
    setDragDay(null);
    if (!source || source === targetDayId) return;

    const from = days.findIndex((d) => d.dayId === source);
    const to = days.findIndex((d) => d.dayId === targetDayId);
    if (from < 0 || to < 0) return;

    const next = reorder(days, from, to);
    setDays(next);
    // sync
    await persistDaysOrder(next.map((d) => d.dayId));
  }

  async function persistDaysOrder(order: string[]) {
    try {
      setBusy(true);
      const res = await fetch(`/api/pt/training-plans/${planId}/reorder`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'days', order }),
      });
      if (!res.ok) throw new Error('Falha ao sincronizar ordenação dos dias');
      setMsg('Dias atualizados.');
    } catch (e: any) {
      setMsg(e?.message ?? 'Erro a guardar');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 2000);
    }
  }

  // ======== DnD exercícios
  function onExDragStart(e: React.DragEvent<HTMLDivElement>, dayId: string, exId: string) {
    setDragExercise({ dayId, exId });
    e.dataTransfer.effectAllowed = 'move';
  }
  function onExDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  async function onExDrop(e: React.DragEvent<HTMLDivElement>, targetDayId: string, targetExId: string) {
    e.preventDefault();
    const src = dragExercise;
    setDragExercise(null);
    if (!src) return;

    setDays((prev) => {
      const copy = prev.map((d) => ({ ...d, exercises: d.exercises.slice() }));
      // remover do dia origem
      const fromDay = copy.find((d) => d.dayId === src.dayId);
      if (!fromDay) return prev;
      const exIdx = fromDay.exercises.findIndex((x) => x.id === src.exId);
      if (exIdx < 0) return prev;
      const [ex] = fromDay.exercises.splice(exIdx, 1);

      // inserir no dia alvo, na posição do target
      const toDay = copy.find((d) => d.dayId === targetDayId);
      if (!toDay) return prev;
      const targetIdx = toDay.exercises.findIndex((x) => x.id === targetExId);
      const insertAt = targetIdx < 0 ? toDay.exercises.length : targetIdx;
      toDay.exercises.splice(insertAt, 0, ex);

      // sync (por dia)
      void persistExercisesOrder(toDay.dayId, toDay.exercises.map((x) => x.id));
      if (fromDay.dayId !== toDay.dayId) {
        void persistExercisesOrder(fromDay.dayId, fromDay.exercises.map((x) => x.id));
      }
      return copy;
    });
  }
  async function onExDropOnDayEnd(e: React.DragEvent<HTMLDivElement>, targetDayId: string) {
    // soltar ao fim da lista do dia
    e.preventDefault();
    const src = dragExercise;
    setDragExercise(null);
    if (!src) return;

    setDays((prev) => {
      const copy = prev.map((d) => ({ ...d, exercises: d.exercises.slice() }));
      const fromDay = copy.find((d) => d.dayId === src.dayId);
      if (!fromDay) return prev;
      const exIdx = fromDay.exercises.findIndex((x) => x.id === src.exId);
      if (exIdx < 0) return prev;
      const [ex] = fromDay.exercises.splice(exIdx, 1);

      const toDay = copy.find((d) => d.dayId === targetDayId);
      if (!toDay) return prev;
      toDay.exercises.push(ex);

      void persistExercisesOrder(toDay.dayId, toDay.exercises.map((x) => x.id));
      if (fromDay.dayId !== toDay.dayId) {
        void persistExercisesOrder(fromDay.dayId, fromDay.exercises.map((x) => x.id));
      }
      return copy;
    });
  }

  async function persistExercisesOrder(dayId: string, order: string[]) {
    try {
      setBusy(true);
      const res = await fetch(`/api/pt/training-plans/${planId}/reorder`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'exercises', dayId, order }),
      });
      if (!res.ok) throw new Error('Falha ao sincronizar exercícios');
      setMsg('Exercícios atualizados.');
    } catch (e: any) {
      setMsg(e?.message ?? 'Erro a guardar');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 2000);
    }
  }

  // ======== UI
  return (
    <section className={`grid gap-3 ${className}`}>
      <div className="grid gap-2 md:grid-cols-3">
        <input
          className="rounded-lg border px-3 py-2 md:col-span-2 bg-white dark:bg-slate-900"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do plano"
        />
        <select
          className="rounded-lg border px-3 py-2 bg-white dark:bg-slate-900"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="DRAFT">Rascunho</option>
          <option value="ACTIVE">Ativo</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
      </div>

      {msg && (
        <div className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 w-fit">
          {busy ? '⏳ ' : '✅ '} {msg}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {days.map((d) => (
          <div
            key={d.dayId}
            className="rounded-2xl border bg-white/70 dark:bg-slate-900/50 p-3"
            draggable
            onDragStart={(e) => onDayDragStart(e, d.dayId)}
            onDragOver={onDayDragOver}
            onDrop={(e) => onDayDrop(e, d.dayId)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{d.title}</h3>
              <span className="text-xs opacity-60">arrasta o cartão para ordenar</span>
            </div>

            <div
              className="grid gap-2"
              onDragOver={onExDragOver}
              onDrop={(e) => onExDropOnDayEnd(e, d.dayId)}
            >
              {d.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="rounded-xl border px-3 py-2 bg-white dark:bg-slate-800 flex items-center justify-between"
                  draggable
                  onDragStart={(e) => onExDragStart(e, d.dayId, ex.id)}
                  onDragOver={onExDragOver}
                  onDrop={(e) => onExDrop(e, d.dayId, ex.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="cursor-grab">⠿</span>
                    <div>
                      <div className="text-sm font-semibold">{ex.name}</div>
                      {ex.notes && <div className="text-xs opacity-70">{ex.notes}</div>}
                    </div>
                  </div>
                  <span className="text-xs opacity-60">arrasta para reordenar / mover de dia</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
