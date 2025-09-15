// src/app/(app)/dashboard/pt/settings/folgas/EditFolgaButton.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

type Props = { folgaId: string };

type Folga = {
  id: string;
  trainer_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

export default function EditFolgaButton({ folgaId }: Props) {
  const sb = supabaseBrowser();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await sb
        .from('pt_days_off')
        .select('id, trainer_id, date, start_time, end_time, reason')
        .eq('id', folgaId)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setErr(error?.message ?? 'Não foi possível carregar a folga.');
      } else {
        const f = data as Folga;
        setDate(f.date ?? '');
        setStartTime(f.start_time ?? '');
        setEndTime(f.end_time ?? '');
        setReason(f.reason ?? '');
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [open, folgaId, sb]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await sb
      .from('pt_days_off')
      .update({
        date: date || null,
        start_time: startTime || null,
        end_time: endTime || null,
        reason: reason || null,
      })
      .eq('id', folgaId);
    setLoading(false);
    if (error) setErr(error.message);
    else { setOpen(false); router.refresh(); }
  }

  async function onDelete() {
    if (!confirm('Eliminar esta folga?')) return;
    setLoading(true);
    const { error } = await sb.from('pt_days_off').delete().eq('id', folgaId);
    setLoading(false);
    if (error) setErr(error.message);
    else { setOpen(false); router.refresh(); }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn chip border border-slate-300 dark:border-slate-700"
      >
        Editar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-3">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !loading && setOpen(false)}
          />
          <form
            onSubmit={onSave}
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Editar folga</h3>
              <button
                type="button"
                className="text-sm opacity-70 hover:opacity-100"
                onClick={() => !loading && setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm opacity-80">Data</span>
                <input
                  type="date"
                  className="rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Início (opcional)</span>
                  <input
                    type="time"
                    className="rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Fim (opcional)</span>
                  <input
                    type="time"
                    className="rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm opacity-80">Motivo (opcional)</span>
                <textarea
                  rows={3}
                  className="rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
                  placeholder="Ex.: férias, formação…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>

              {err && <div className="text-sm text-rose-600">{err}</div>}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onDelete}
                disabled={loading}
                className="px-3 py-2 rounded-md border border-rose-300/50 text-rose-700 dark:text-rose-400"
              >
                Eliminar
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="px-3 py-2 rounded-md border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-60"
                >
                  {loading ? 'A guardar…' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
