'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Exercise = {
  id: string;
  day_id: string;
  name?: string | null;
  order_index: number;
  exercise_id?: string | null;
  notes?: string | null;
};

type Day = {
  id: string;
  title?: string | null;
  day_of_week?: number | null;
  day_index: number;
  exercises: Exercise[];
};

export default function PlanBoard({ planId }: { planId: string }) {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<'days' | 'exercises' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/sb/plan/${planId}/full`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Falha ao carregar plano');

      const sortedDays: Day[] = (data.days as Day[]).slice().sort((a,b)=>a.day_index-b.day_index)
        .map(d => ({
          ...d,
          exercises: (d.exercises ?? []).slice().sort((a,b)=>a.order_index-b.order_index)
        }));
      setDays(sortedDays);
    } catch (e: any) {
      setErr(e?.message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [planId]);

  // ==== Drag state ====
  const [dragDayId, setDragDayId] = useState<string | null>(null);
  const [dragExId, setDragExId] = useState<string | null>(null);
  const [dragFromDay, setDragFromDay] = useState<string | null>(null);

  // ==== Helpers ====
  function reorderDays(local: Day[], overId: string, draggedId: string) {
    const copy = local.slice();
    const from = copy.findIndex(d => d.id === draggedId);
    const to   = copy.findIndex(d => d.id === overId);
    if (from < 0 || to < 0 || from === to) return copy;
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy.map((d, i) => ({ ...d, day_index: i }));
  }

  function moveExercise(local: Day[], exId: string, targetDayId: string, targetIndex: number) {
    // remove de origem
    const copy = local.map(d => ({ ...d, exercises: d.exercises.slice() }));
    let moved: Exercise | null = null;
    for (const d of copy) {
      const i = d.exercises.findIndex(e => e.id === exId);
      if (i >= 0) { moved = d.exercises.splice(i, 1)[0]; break; }
    }
    if (!moved) return copy;

    // insere no destino
    const target = copy.find(d => d.id === targetDayId);
    if (!target) return copy;
    moved.day_id = targetDayId;
    target.exercises.splice(targetIndex, 0, moved);

    // renumera
    copy.forEach(d => { d.exercises = d.exercises.map((e, i) => ({ ...e, order_index: i })); });
    return copy;
  }

  // ==== Drag & Drop handlers (DAYS) ====
  function onDayDragStart(id: string) { setDragDayId(id); }
  function onDayDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragDayId || dragDayId === overId) return;
    setDays(prev => reorderDays(prev, overId, dragDayId));
  }
  async function onDayDrop() {
    if (!dragDayId) return;
    setSaving('days');
    try {
      const order = days.map(d => ({ dayId: d.id, index: d.day_index }));
      const res = await fetch(`/api/sb/plan/${planId}/reorder-days`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Erro a gravar ordem dos dias');
    } catch (e: any) { setErr(e?.message || 'Erro'); }
    finally { setSaving(null); setDragDayId(null); }
  }

  // ==== Drag & Drop handlers (EXERCISES) ====
  function onExerciseDragStart(exId: string, fromDayId: string) {
    setDragExId(exId);
    setDragFromDay(fromDayId);
  }

  function onExerciseDragOver(e: React.DragEvent, targetDayId: string, beforeIndex: number) {
    e.preventDefault();
    if (!dragExId) return;
    setDays(prev => moveExercise(prev, dragExId, targetDayId, beforeIndex));
  }

  async function onExerciseDrop() {
    if (!dragExId) return;
    setSaving('exercises');
    try {
      const items = days.flatMap(d => d.exercises.map((e,i)=>({ id:e.id, dayId:d.id, index:i })));
      const res = await fetch(`/api/sb/plan/${planId}/reorder-exercises`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Erro a gravar ordem dos exercícios');
    } catch (e:any) { setErr(e?.message || 'Erro'); }
    finally { setSaving(null); setDragExId(null); setDragFromDay(null); }
  }

  const weekNames = useMemo(() => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'], []);

  if (loading) return <div className="rounded-xl border p-4">A carregar…</div>;
  if (err) return <div className="rounded-xl border p-4 text-rose-600">{err}</div>;

  return (
    <div className="space-y-3">
      {saving && (
        <div className="text-sm opacity-70">A gravar alterações…</div>
      )}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}
        onDragEnd={() => { onExerciseDrop(); onDayDrop(); }}
      >
        {days.map((d, di) => (
          <div key={d.id}
            className={`rounded-2xl border bg-white/70 dark:bg-white/5 backdrop-blur p-3 flex flex-col`}
            draggable
            onDragStart={() => onDayDragStart(d.id)}
            onDragOver={(e) => onDayDragOver(e, d.id)}
            onDrop={onDayDrop}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="font-semibold truncate">
                {d.title || (d.day_of_week!=null ? weekNames[d.day_of_week] : `Dia ${di+1}`)}
              </div>
              <div className="text-xs opacity-60">#{d.day_index+1}</div>
            </div>

            <div
              className="flex flex-col gap-2"
              onDragOver={(e)=>onExerciseDragOver(e, d.id, d.exercises.length)}
              onDrop={onExerciseDrop}
            >
              {d.exercises.map((ex, ei) => (
                <div key={ex.id}
                  draggable
                  onDragStart={()=>onExerciseDragStart(ex.id, d.id)}
                  onDragOver={(e)=>onExerciseDragOver(e, d.id, ei)}
                  className={`rounded-xl border px-3 py-2 bg-sky-50/70 dark:bg-sky-500/10`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{ex.name || 'Exercício'}</div>
                    <span className="text-xs opacity-60">#{ei+1}</span>
                  </div>
                  {ex.notes && <div className="text-xs opacity-70 mt-1 line-clamp-2">{ex.notes}</div>}
                </div>
              ))}

              <div className="text-xs opacity-60 text-center py-2 border border-dashed rounded-lg">
                Arrasta aqui para colocar no fim
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs opacity-70">
        Dica: podes arrastar o <b>título do dia</b> para reordenar os dias, e arrastar os <b>exercícios</b> entre dias.
      </div>
    </div>
  );
}
