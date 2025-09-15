'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import Badge from '@/components/ui/Badge';

export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type ExerciseItem = {
  id: string;
  day_id: string;
  idx: number;
  exercise_id: string | null;
  title: string | null;
  sets: number | null;
  reps: string | null;
  rest_sec: number | null;
  notes: string | null;
};

export type DayWithExercises = {
  id: string;
  plan_id: string;
  day_index: number;
  title: string | null;
  exercises: ExerciseItem[];
};

type Props = {
  planId: string;
  initialTitle: string;
  initialStatus: PlanStatus;
  initialDays: DayWithExercises[];
  className?: string;
};

export default function PlanEditorDnD({
  planId,
  initialTitle,
  initialStatus,
  initialDays,
  className,
}: Props) {
  const sb = useMemo(() => supabaseBrowser(), []);
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<PlanStatus>(initialStatus);
  const [days, setDays] = useState<DayWithExercises[]>(initialDays ?? []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // -------- Helpers de normalização (lida com schemas diferentes) ----------
  function normalizeIdx(row: any): number {
    return Number(
      row?.idx ??
      row?.order_idx ??
      row?.position ??
      row?.order ??
      0
    );
  }
  function normalizeDayTitle(row: any): string | null {
    return (row?.title ?? row?.label ?? null) as string | null;
  }

  // Carregar dias + exercícios
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);

        // Dias
        const { data: dRaw, error: dErr } = await sb
          .from('plan_days')
          .select('*')
          .eq('plan_id', planId)
          .order('day_index', { ascending: true });

        if (dErr) throw dErr;

        const dayRows = (dRaw ?? []) as any[];

        // Exercícios
        const dayIds = dayRows.map((x) => x.id);
        const { data: itRaw, error: itErr } = await sb
          .from('plan_exercises')
          .select('*')
          .in('day_id', dayIds)
          .order('day_id', { ascending: true });

        if (itErr) throw itErr;

        const items = (itRaw ?? []).map((r: any) => ({
          id: String(r.id),
          day_id: String(r.day_id),
          idx: normalizeIdx(r),
          exercise_id: r.exercise_id ?? null,
          title: r.title ?? null,
          sets: r.sets ?? null,
          reps: r.reps ?? null,
          rest_sec: r.rest_sec ?? null,
          notes: r.notes ?? null,
        })) as ExerciseItem[];

        const grouped: Record<string, ExerciseItem[]> = {};
        for (const it of items) {
          grouped[it.day_id] ??= [];
          grouped[it.day_id].push(it);
        }
        for (const k of Object.keys(grouped)) {
          grouped[k].sort((a, b) => a.idx - b.idx);
        }

        const ds: DayWithExercises[] = dayRows.map((r: any) => ({
          id: String(r.id),
          plan_id: String(r.plan_id),
          day_index: Number(r.day_index ?? 0),
          title: normalizeDayTitle(r),
          exercises: grouped[String(r.id)] ?? [],
        }));

        if (!active) return;
        setDays(ds);
      } catch {
        if (!active) return;
        setDays([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [planId, sb]);

  // ---------- Persistência ----------
  async function saveDayOrder(newDays: DayWithExercises[]) {
    try {
      setSaving(true);
      const order = newDays.map((d, i) => ({ id: d.id, day_index: i }));
      await fetch(`/api/pt/training-plans/${planId}/reorder-days`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ order }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveItemMoves(moves: Array<{ id: string; day_id: string; idx: number }>) {
    try {
      setSaving(true);
      await fetch(`/api/pt/training-plans/${planId}/reorder-items`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ moves }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function persistTitle(newTitle: string) {
    try {
      setSaving(true);
      await sb.from('training_plans').update({ title: newTitle }).eq('id', planId);
    } finally {
      setSaving(false);
    }
  }

  async function persistStatus(newStatus: PlanStatus) {
    try {
      setSaving(true);
      await sb.from('training_plans').update({ status: newStatus }).eq('id', planId);
    } finally {
      setSaving(false);
    }
  }

  // ---------- Drag state ----------
  const [dragDayId, setDragDayId] = useState<string | null>(null);
  const [dragItemId, setDragItemId] = useState<string | null>(null);

  // ---------- DnD: Dias ----------
  function onDayDragStart(id: string) {
    setDragDayId(id);
  }
  function onDayDrop(targetId: string) {
    if (!dragDayId || dragDayId === targetId) return;
    const list = [...days];
    const fromIdx = list.findIndex((d) => d.id === dragDayId);
    const toIdx = list.findIndex((d) => d.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);

    const normalized = list.map((d, i) => ({ ...d, day_index: i }));
    setDays(normalized);
    void saveDayOrder(normalized);
    setDragDayId(null);
  }

  // ---------- DnD: Exercícios (pode mudar de dia) ----------
  function onItemDragStart(id: string) {
    setDragItemId(id);
  }
  function onItemDrop(targetDayId: string, beforeItemId?: string) {
    if (!dragItemId) return;

    // encontrar origem e indices
    const sourceDayIdx = days.findIndex((d) => d.exercises.some((e) => e.id === dragItemId));
    if (sourceDayIdx < 0) return;
    const sourceDay = days[sourceDayIdx];
    const sourceItemIdx = sourceDay.exercises.findIndex((e) => e.id === dragItemId);
    const sourceItem = sourceDay.exercises[sourceItemIdx];
    if (!sourceItem) return;

    // clonar estado
    const next = days.map((d) => ({ ...d, exercises: d.exercises.map((e) => ({ ...e })) }));

    // remover da origem
    next[sourceDayIdx].exercises.splice(sourceItemIdx, 1);
    next[sourceDayIdx].exercises = next[sourceDayIdx].exercises
      .map((e, i) => ({ ...e, idx: i }));

    // destino
    const destIdx = next.findIndex((d) => d.id === targetDayId);
    if (destIdx < 0) return;

    let insertIdx = next[destIdx].exercises.length;
    if (beforeItemId) {
      const pos = next[destIdx].exercises.findIndex((e) => e.id === beforeItemId);
      if (pos >= 0) insertIdx = pos;
    }

    const moved: ExerciseItem = { ...sourceItem, day_id: targetDayId, idx: insertIdx };
    next[destIdx].exercises.splice(insertIdx, 0, moved);
    next[destIdx].exercises = next[destIdx].exercises
      .map((e, i) => ({ ...e, idx: i }));

    setDays(next);

    // Persistir movimentos (dedupe por id)
    const moves: Array<{ id: string; day_id: string; idx: number }> = [
      ...next[sourceDayIdx].exercises.map((e) => ({ id: e.id, day_id: e.day_id, idx: e.idx })),
      ...next[destIdx].exercises.map((e) => ({ id: e.id, day_id: e.day_id, idx: e.idx })),
    ];
    const seen = new Set<string>();
    const compact = moves.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
    void saveItemMoves(compact);

    setDragItemId(null);
  }

  // ---------- UI ----------
  if (loading) {
    return <div className="rounded-xl border p-4 text-sm opacity-70">A carregar…</div>;
  }

  return (
    <section className={`grid gap-4 ${className ?? ''}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">✍️ Editar plano</h1>
          <p className="text-slate-500 text-sm">Arrasta dias e exercícios para reorganizar.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => persistTitle(title)}
            className="rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900"
          />
          <select
            value={status}
            onChange={(e) => {
              const v = e.target.value as PlanStatus;
              setStatus(v);
              void persistStatus(v);
            }}
            className="rounded-lg border px-2 py-2 text-sm bg-white dark:bg-slate-900"
            aria-label="Estado do plano"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="ACTIVE">Ativo</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
          {saving ? <Badge variant="info">a guardar…</Badge> : <Badge variant="success">guardado</Badge>}
        </div>
      </div>

      <div
        className="grid gap-3 md:gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}
      >
        {days.map((d) => (
          <div
            key={d.id}
            draggable
            onDragStart={() => onDayDragStart(d.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDayDrop(d.id)}
            className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 backdrop-blur p-3 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{d.title ?? `Dia ${d.day_index + 1}`}</div>
              <Badge variant="neutral">{d.exercises.length} exercícios</Badge>
            </div>

            <ul className="space-y-2">
              {d.exercises.map((it, idx) => (
                <li
                  key={it.id}
                  draggable
                  onDragStart={() => onItemDragStart(it.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onItemDrop(d.id, it.id)} // soltar antes deste item
                  className="rounded-lg border bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{it.title ?? `Exercício ${idx + 1}`}</div>
                    <div className="text-xs text-slate-500">
                      {it.sets ?? '—'} séries · {it.reps ?? '—'} reps · {it.rest_sec ?? '—'}s
                    </div>
                  </div>
                  {it.notes && <p className="mt-1 text-xs text-slate-500">{it.notes}</p>}
                </li>
              ))}

              {/* Largar no fim do dia */}
              <li
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onItemDrop(d.id)}
                className="rounded-lg border border-dashed text-center text-xs py-2 text-slate-400"
              >
                Largar aqui para enviar para o fim
              </li>
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
