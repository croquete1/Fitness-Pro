/* eslint-disable @next/next/no-img-element */

'use client';

import { useEffect, useMemo, useState } from 'react';

export type ExerciseLite = {
  id: string;
  name: string;
  media_url?: string | null;
  muscle_image_url?: string | null;
  primary_muscle?: string | null;
  equipment?: string | null;
};

const MUSCLES = [
  'Chest','Back','Shoulders','Biceps','Triceps','Legs','Glutes','Abs','Calves',
  'Full Body','Cardio','Mobility'
];

export default function ExercisePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (ex: ExerciseLite) => void;
}) {
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ExerciseLite[]>([]);

  const q2 = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    if (!open) return;
    let abort = false;
    const run = async () => {
      setLoading(true);
      try {
        const url = `/api/exercises/search?q=${encodeURIComponent(q2)}&muscle=${encodeURIComponent(muscle)}`;
        const res = await fetch(url);
        const j = await res.json();
        if (!abort) setItems(j.exercises ?? []);
      } catch {
        if (!abort) setItems([]);
      } finally {
        if (!abort) setLoading(false);
      }
    };
    const t = setTimeout(run, 250);
    return () => { abort = true; clearTimeout(t); };
  }, [q2, muscle, open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] grid place-items-center bg-black/30 p-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <div className="w-full max-w-5xl rounded-2xl border bg-white p-4 shadow-xl dark:bg-[var(--card-bg)]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold">Adicionar exercício</h3>
          <button className="btn ghost" onClick={onClose}>Fechar</button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por nome…"
            className="input"
            style={{ height: 38, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)', flex: 1, minWidth: 240 }}
          />
          <select
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
            className="input"
            style={{ height: 38, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)' }}
          >
            <option value="">Todos os grupos</option>
            {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, maxHeight: '60vh', overflow: 'auto' }}
        >
          {loading ? (
            <div className="text-muted">A procurar…</div>
          ) : items.length === 0 ? (
            <div className="text-muted">Sem resultados</div>
          ) : items.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className="card hover:border-[var(--border-strong)]"
              style={{ textAlign: 'left', padding: 10 }}
              onClick={() => { onPick(ex); onClose(); }}
            >
              <div className="w-full aspect-video overflow-hidden rounded-lg border mb-2 bg-[var(--hover)] grid place-items-center">
                {ex.media_url ? (
                  // pode ser GIF/MP4 -> img cobre GIF; se for vídeo podes trocar para <video>
                  <img src={ex.media_url} alt={ex.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <span className="text-sm text-muted">Sem media</span>
                )}
              </div>
              <div className="font-semibold">{ex.name}</div>
              <div className="text-xs opacity-70">
                {ex.primary_muscle || '—'} {ex.equipment ? `• ${ex.equipment}` : ''}
              </div>
              {ex.muscle_image_url && (
                <div className="mt-2">
                  <img
                    src={ex.muscle_image_url}
                    alt="Grupos musculares"
                    style={{ width: '100%', height: 80, objectFit: 'contain', opacity: .9 }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
