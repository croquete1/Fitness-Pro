'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import Badge from '@/components/ui/Badge';

type Day = {
  id: string;
  plan_id: string;
  day_index: number;
  title: string | null;
};

type Item = {
  id: string;
  day_id: string;
  idx: number;
  exercise_id: string | null;
  title: string | null;
  sets: number | null;
  reps: string | null;     // ex.: "8-10"
  rest_sec: number | null; // descanso em segundos
  notes: string | null;
};

type Props = { planId: string; initialTitle: string };

export default function PlanEditor({ planId, initialTitle }: Props) {
  const sb = useMemo(() => supabaseBrowser(), []);
  const [title, setTitle] = useState(initialTitle);
  const [days, setDays] = useState<Day[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helpers
  function itemsOf(dayId: string) {
    return items.filter((i) => i.day_id === dayId).sort((a, b) => a.idx - b.idx);
  }

  // Carregar dias + exercícios com fallback se a coluna `idx` não existir
  useEffect(() => {
    let active = true;

    async function fetchAll() {
      try {
        setLoading(true);

        // 1) Dias
        const { data: d, error: dErr } = await sb
          .from('plan_days')
          .select('id, plan_id, day_index, title')
          .eq('plan_id', planId)
          .order('day_index', { ascending: true });

        if (dErr) throw dErr;
        const dayRows = (d ?? []) as Day[];
        if (!active) return;

        setDays(dayRows);

        const dayIds = dayRows.map((x) => x.id);
        if (dayIds.length === 0) {
          setItems([]);
          return;
        }

        // 2) Exercícios (1ª tentativa: com `idx`)
        const { data: it1, error: itErr1 } = await sb
          .from('plan_exercises')
          .select('id, day_id, idx, exercise_id, title, sets, reps, rest_sec, notes')
          .in('day_id', dayIds)
          .order('idx', { ascending: true });

        if (!itErr1 && it1) {
          const normalized = (it1 as any[]).map((r) => ({
            id: String(r.id),
            day_id: String(r.day_id),
            idx: Number(r.idx ?? 0),
            exercise_id: r.exercise_id ?? null,
            title: r.title ?? null,
            sets: r.sets ?? null,
            reps: r.reps ?? null,
            rest_sec: r.rest_sec ?? null,
            notes: r.notes ?? null,
          })) as Item[];
          if (!active) return;
          setItems(normalized);
          return;
        }

        // 3) Fallback se `idx` não existir: ordenar por `created_at` (se existir)
        const { data: it2, error: itErr2 } = await sb
          .from('plan_exercises')
          .select('id, day_id, exercise_id, title, sets, reps, rest_sec, notes, created_at')
          .in('day_id', dayIds)
          .order('created_at', { ascending: true });

        if (itErr2) {
          // fallback final: sem order do servidor
          const { data: it3 } = await sb
            .from('plan_exercises')
            .select('id, day_id, exercise_id, title, sets, reps, rest_sec, notes')
            .in('day_id', dayIds);

          const grouped: Record<string, any[]> = {};
          (it3 ?? []).forEach((r: any) => {
            const key = String(r.day_id);
            grouped[key] = grouped[key] ?? [];
            grouped[key].push(r);
          });

          const rebuilt: Item[] = [];
          for (const [dayId, arr] of Object.entries(grouped)) {
            arr.forEach((r: any, i: number) => {
              rebuilt.push({
                id: String(r.id),
                day_id: dayId,
                idx: i,
                exercise_id: r.exercise_id ?? null,
                title: r.title ?? null,
                sets: r.sets ?? null,
                reps: r.reps ?? null,
                rest_sec: r.rest_sec ?? null,
                notes: r.notes ?? null,
              });
            });
          }
          if (!active) return;
          setItems(rebuilt);
          return;
        }

        // it2 OK → construir idx local por dia
        const grouped: Record<string, any[]> = {};
        (it2 ?? []).forEach((r: any) => {
          const key = String(r.day_id);
          grouped[key] = grouped[key] ?? [];
          grouped[key].push(r);
        });

        const rebuilt: Item[] = [];
        for (const [dayId, arr] of Object.entries(grouped)) {
          arr.forEach((r: any, i: number) => {
            rebuilt.push({
              id: String(r.id),
              day_id: dayId,
              idx: i,
              exercise_id: r.exercise_id ?? null,
              title: r.title ?? null,
              sets: r.sets ?? null,
              reps: r.reps ?? null,
              rest_sec: r.rest_sec ?? null,
              notes: r.notes ?? null,
            });
          });
        }
        if (!active) return;
        setItems(rebuilt);
      } catch {
        if (!active) return;
        setDays([]);
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      active = false;
    };
  }, [planId, sb]);

  // Persistir reordenação de dias
  async function saveDayOrder(newDays: Day[]) {
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

  // Persistir reordenação/movimentação de exercícios
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

  // Adicionar novo DIA ao fim
  async function onAddDay() {
    try {
      setSaving(true);
      const nextIndex = days.length;
      const defaultTitle = `Dia ${nextIndex + 1}`;
      const { data, error } = await sb
        .from('plan_days')
        .insert({ plan_id: planId, day_index: nextIndex, title: defaultTitle })
        .select('id, plan_id, day_index, title')
        .single();
      if (!error && data) {
        setDays((prev) => [...prev, data as Day]);
      }
    } finally {
      setSaving(false);
    }
  }

  // Adicionar EXERCÍCIO num dia (com fallback se `idx` não existir na BD)
  async function onAddExercise(dayId: string) {
    const nextIdx = itemsOf(dayId).length;
    try {
      setSaving(true);

      // 1ª tentativa: inserir com idx
      const tryWithIdx = await sb
        .from('plan_exercises')
        .insert({
          day_id: dayId,
          idx: nextIdx,
          exercise_id: null,
          title: `Exercício ${nextIdx + 1}`,
          sets: 3,
          reps: '10',
          rest_sec: 60,
          notes: null,
        })
        .select('id, day_id, idx, exercise_id, title, sets, reps, rest_sec, notes')
        .single();

      if (!tryWithIdx.error && tryWithIdx.data) {
        setItems((prev) => [...prev, tryWithIdx.data as unknown as Item]);
        return;
      }

      // Fallback: sem idx
      const tryWithoutIdx = await sb
        .from('plan_exercises')
        .insert({
          day_id: dayId,
          exercise_id: null,
          title: `Exercício ${nextIdx + 1}`,
          sets: 3,
          reps: '10',
          rest_sec: 60,
          notes: null,
        })
        .select('id, day_id, exercise_id, title, sets, reps, rest_sec, notes, created_at')
        .single();

      const newRow = tryWithoutIdx.data as any;
      if (newRow) {
        // atribuir idx localmente
        setItems((prev) => [
          ...prev,
          {
            id: String(newRow.id),
            day_id: dayId,
            idx: nextIdx,
            exercise_id: newRow.exercise_id ?? null,
            title: newRow.title ?? null,
            sets: newRow.sets ?? null,
            reps: newRow.reps ?? null,
            rest_sec: newRow.rest_sec ?? null,
            notes: newRow.notes ?? null,
          },
        ]);

        // tentar persistir a ordem (se o teu endpoint suportar outra coluna, ele mapeia lá)
        try {
          const after = itemsOf(dayId).concat([
            {
              id: String(newRow.id),
              day_id: dayId,
              idx: nextIdx,
              exercise_id: newRow.exercise_id ?? null,
              title: newRow.title ?? null,
              sets: newRow.sets ?? null,
              reps: newRow.reps ?? null,
              rest_sec: newRow.rest_sec ?? null,
              notes: newRow.notes ?? null,
            },
          ]);
          await saveItemMoves(after.map((r, i) => ({ id: r.id, day_id: dayId, idx: i })));
        } catch {
          // best-effort
        }
      }
    } finally {
      setSaving(false);
    }
  }

  // DnD dias
  const [dragDayId, setDragDayId] = useState<string | null>(null);
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

  // DnD exercícios
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  function onItemDragStart(id: string) {
    setDragItemId(id);
  }
  function onItemDrop(targetDayId: string, beforeItemId?: string) {
    if (!dragItemId) return;
    const source = items.find((i) => i.id === dragItemId);
    if (!source) return;

    const without = items.filter((i) => i.id !== dragItemId);
    const dest = without.filter((i) => i.day_id === targetDayId).sort((a, b) => a.idx - b.idx);

    let insertIdx = dest.length;
    if (beforeItemId) {
      const pos = dest.findIndex((i) => i.id === beforeItemId);
      if (pos >= 0) insertIdx = pos;
    }

    const moved: Item = { ...source, day_id: targetDayId, idx: insertIdx };
    const newDest = [...dest.slice(0, insertIdx), moved, ...dest.slice(insertIdx)];

    const normalizedDest = newDest.map((i, n) => ({ ...i, idx: n }));
    const origin = without
      .filter((i) => i.day_id === source.day_id)
      .sort((a, b) => a.idx - b.idx)
      .map((i, n) => ({ ...i, idx: n }));

    const rest = without.filter((i) => i.day_id !== source.day_id && i.day_id !== targetDayId);
    const finalItems = [...rest, ...origin, ...normalizedDest];
    setItems(finalItems);

    const moves = [...origin, ...normalizedDest].map((i) => ({
      id: i.id,
      day_id: i.day_id,
      idx: i.idx,
    }));
    const seen = new Set<string>();
    const compact = moves.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
    void saveItemMoves(compact);

    setDragItemId(null);
  }

  // UI
  if (loading) {
    return <div className="rounded-xl border p-4 text-sm opacity-70">A carregar…</div>;
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">✍️ Editar plano</h1>
          <p className="text-slate-500 text-sm">Arrasta dias e exercícios para reorganizar.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={async () => {
              try {
                setSaving(true);
                await sb.from('training_plans').update({ title }).eq('id', planId);
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900"
          />
          <button className="btn chip" onClick={onAddDay}>+ Adicionar dia</button>
          {saving ? <Badge variant="info">a guardar…</Badge> : <Badge variant="success">guardado</Badge>}
        </div>
      </div>

      {/* GRID de dias */}
      <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        {days.map((d) => {
          const its = itemsOf(d.id);
          return (
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
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{its.length} exercícios</Badge>
                  <button className="btn chip" onClick={() => onAddExercise(d.id)}>+ exercício</button>
                </div>
              </div>

              <ul className="space-y-2">
                {its.map((it, idx) => (
                  <li
                    key={it.id}
                    draggable
                    onDragStart={() => onItemDragStart(it.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onItemDrop(d.id, it.id)}
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
          );
        })}
      </div>
    </section>
  );
}
