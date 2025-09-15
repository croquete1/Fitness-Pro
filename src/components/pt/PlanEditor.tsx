'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import Badge from '@/components/ui/Badge';

// ---- Tipos locais, alinhados com os types gerados ----
// (plan_days)
type Day = {
  id: string;
  plan_id: string;
  day_index: number;
  title: string | null;
};

// (plan_exercises) — no typegen estão expostas estas colunas.
// Mantemos campos extra como opcionais para UI (não usados no insert/update).
type Item = {
  id: string;
  day_id: string;
  order_index: number;
  title: string | null;
  notes: string | null;
  // opcionais (se existirem no teu schema real, não quebram a UI)
  exercise_id?: string | null;
  sets?: number | null;
  reps?: string | null;
  rest_sec?: number | null;
};

type Props = { planId: string; initialTitle: string };

export default function PlanEditor({ planId, initialTitle }: Props) {
  const sb = useMemo(() => supabaseBrowser(), []);
  const [title, setTitle] = useState(initialTitle);
  const [days, setDays] = useState<Day[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dias + exercícios
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);

        const { data: d } = await sb
          .from('plan_days')
          .select('id, plan_id, day_index, title')
          .eq('plan_id', planId)
          .order('day_index', { ascending: true });

        const dayIds = (d ?? []).map((x) => x.id);

        const { data: it } = await sb
          .from('plan_exercises')
          .select('id, day_id, order_index, title, notes') // ⚠ tipos gerados expõem estas colunas
          .in('day_id', dayIds.length ? dayIds : ['__none__'])
          .order('order_index', { ascending: true });

        if (!active) return;
        setDays((d ?? []) as Day[]);
        setItems((it ?? []) as Item[]);
      } catch {
        if (!active) return;
        setDays([]);
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [planId, sb]);

  // Helpers
  function itemsOf(dayId: string) {
    return items
      .filter((i) => i.day_id === dayId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  // Drag state
  const [dragDayId, setDragDayId] = useState<string | null>(null);
  const [dragItemId, setDragItemId] = useState<string | null>(null);

  // Persistir reordenação de dias
  async function saveDayOrder(newDays: Day[]) {
    try {
      setSaving(true);
      const order = newDays.map((d, i) => ({ id: d.id, day_index: i }));
      await fetch(`/api/pt/plans/${planId}/reorder-days`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ order }),
      });
    } finally {
      setSaving(false);
    }
  }

  // Persistir reordenação/movimentação de exercícios
  async function saveItemMoves(
    moves: Array<{ id: string; day_id: string; order_index: number }>
  ) {
    try {
      setSaving(true);
      await fetch(`/api/pt/plans/${planId}/reorder-items`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ moves }),
      });
    } finally {
      setSaving(false);
    }
  }

  // Adicionar novo exercício no fim de um dia
  async function addItem(dayId: string) {
    try {
      setSaving(true);
      const nextIndex =
        itemsOf(dayId).reduce((max, it) => Math.max(max, it.order_index), -1) + 1;

      const { error } = await sb.from('plan_exercises').insert({
        day_id: dayId,
        order_index: nextIndex, // ✅ coluna correta
        title: 'Novo exercício',
        notes: null,
      });
      if (error) throw error;

      // refetch leve (podes otimizar se quiseres)
      const { data: it } = await sb
        .from('plan_exercises')
        .select('id, day_id, order_index, title, notes')
        .eq('day_id', dayId)
        .order('order_index', { ascending: true });

      setItems((prev) => {
        const others = prev.filter((i) => i.day_id !== dayId);
        return [...others, ...((it ?? []) as Item[])];
      });
    } catch {
      // noop — poderias dar um toast
    } finally {
      setSaving(false);
    }
  }

  // DnD dias
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

  // DnD exercícios (pode mudar de dia)
  function onItemDragStart(id: string) {
    setDragItemId(id);
  }
  function onItemDrop(targetDayId: string, beforeItemId?: string) {
    if (!dragItemId) return;
    const source = items.find((i) => i.id === dragItemId);
    if (!source) return;

    // remover o item movido da coleção
    const without = items.filter((i) => i.id !== dragItemId);

    // destino
    const dest = without
      .filter((i) => i.day_id === targetDayId)
      .sort((a, b) => a.order_index - b.order_index);

    // posição de inserção
    let insertIdx = dest.length;
    if (beforeItemId) {
      const pos = dest.findIndex((i) => i.id === beforeItemId);
      if (pos >= 0) insertIdx = pos;
    }

    // inserir no destino
    const moved: Item = { ...source, day_id: targetDayId, order_index: insertIdx };
    const newDest = [...dest.slice(0, insertIdx), moved, ...dest.slice(insertIdx)];

    // normalizar índices destino e origem
    const normalizedDest = newDest.map((i, n) => ({ ...i, order_index: n }));
    const origin = without
      .filter((i) => i.day_id === source.day_id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((i, n) => ({ ...i, order_index: n }));

    // restantes dias
    const rest = without.filter(
      (i) => i.day_id !== source.day_id && i.day_id !== targetDayId
    );

    const finalItems = [...rest, ...origin, ...normalizedDest];
    setItems(finalItems);

    // persistir (dedupe por id)
    const moves = [...origin, ...normalizedDest].map((i) => ({
      id: i.id,
      day_id: i.day_id,
      order_index: i.order_index,
    }));
    const seen = new Set<string>();
    const compact = moves.filter((m) =>
      seen.has(m.id) ? false : (seen.add(m.id), true)
    );
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
          {saving ? <Badge variant="info">a guardar…</Badge> : <Badge variant="success">guardado</Badge>}
        </div>
      </div>

      {/* GRID de dias */}
      <div
        className="grid gap-3 md:gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}
      >
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
                  <button
                    type="button"
                    onClick={() => addItem(d.id)}
                    className="rounded-md border px-2 py-1 text-xs bg-white/70 dark:bg-slate-800 hover:bg-slate-50"
                    title="Adicionar exercício"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              <ul className="space-y-2">
                {its.map((it, idx) => (
                  <li
                    key={it.id}
                    draggable
                    onDragStart={() => onItemDragStart(it.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onItemDrop(d.id, it.id)} // largar antes deste item
                    className="rounded-lg border bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">
                        {it.title ?? `Exercício ${idx + 1}`}
                      </div>
                      <div className="text-xs text-slate-500">
                        {/* Mostra placeholders se não houver colunas adicionais */}
                        {(it.sets ?? '—')} séries · {(it.reps ?? '—')} reps · {(it.rest_sec ?? '—')}s
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