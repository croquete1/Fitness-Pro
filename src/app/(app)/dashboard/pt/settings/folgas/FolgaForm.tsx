// src/app/(app)/dashboard/pt/settings/folgas/FolgaForm.tsx
'use client';

import * as React from 'react';

export default function FolgaForm() {
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0,10));
  const [allDay, setAllDay] = React.useState(true);
  const [start, setStart] = React.useState('09:00');
  const [end, setEnd] = React.useState('18:00');
  const [title, setTitle] = React.useState('Folga');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const day = new Date(date);
    const startAt = new Date(day);
    const endAt   = new Date(day);

    if (allDay) {
      startAt.setHours(0,0,0,0);
      endAt.setHours(23,59,59,999);
    } else {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      startAt.setHours(sh, sm || 0, 0, 0);
      endAt.setHours(eh, em || 0, 0, 0);
    }

    const res = await fetch('/api/pt/folgas', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({ start: startAt.toISOString(), end: endAt.toISOString(), title }),
    });
    setBusy(false);
    if (!res.ok) { setErr(await res.text()); return; }
    location.reload();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <label className="small text-muted">Título</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label className="small text-muted">Dia</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label className="small text-muted">
        <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} style={{ marginRight: 6 }} />
        Dia inteiro
      </label>

      {!allDay && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label className="small text-muted">Das</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="small text-muted">Às</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
      )}

      {!!err && <div className="badge-danger" role="alert">{err}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'A guardar…' : 'Adicionar folga'}
        </button>
      </div>
    </form>
  );
}
