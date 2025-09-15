// src/app/(app)/dashboard/pt/settings/folgas/FolgaForm.tsx
'use client';

import React, { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

export default function FolgaForm() {
  const sb = supabaseBrowser();
  const router = useRouter();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { data: auth } = await sb.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        setErr('Sessão inválida. Inicia sessão de novo.');
        return;
      }

      const { error } = await sb
        .from('pt_days_off')
        .insert({
          trainer_id: uid,
          date: date || null,
          start_time: startTime || null,
          end_time: endTime || null,
          reason: reason || null,
        });

      if (error) setErr(error.message);
      else {
        setDate(''); setStartTime(''); setEndTime(''); setReason('');
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Data</span>
        <input
          type="date"
          required
          className="rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          placeholder="Ex.: férias, formação, indisponibilidade…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>

      {err && <div className="text-sm text-rose-600">{err}</div>}

      <div className="flex justify-end">
        <button
          disabled={busy}
          className="px-3 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-60"
        >
          {busy ? 'A criar…' : 'Adicionar folga'}
        </button>
      </div>
    </form>
  );
}
