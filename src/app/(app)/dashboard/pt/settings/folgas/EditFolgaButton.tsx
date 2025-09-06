// src/app/(app)/dashboard/pt/settings/folgas/EditFolgaButton.tsx
'use client';

import * as React from 'react';

type Props = {
  id: string;
  initial: { title: string; start: string; end: string };
};

export default function EditFolgaButton({ id, initial }: Props) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(initial.title);
  const [date, setDate] = React.useState(() => initial.start.slice(0,10));
  const [allDay, setAllDay] = React.useState(() => {
    const s = new Date(initial.start);
    const e = new Date(initial.end);
    return s.getHours() === 0 && s.getMinutes() === 0 && e.getHours() === 23 && e.getMinutes() >= 58;
  });
  const [start, setStart] = React.useState(() => new Date(initial.start).toTimeString().slice(0,5));
  const [end, setEnd] = React.useState(() => new Date(initial.end).toTimeString().slice(0,5));
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  function buildRange() {
    const day = new Date(date);
    const s = new Date(day);
    const e = new Date(day);
    if (allDay) {
      s.setHours(0,0,0,0);
      e.setHours(23,59,59,999);
    } else {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      s.setHours(sh, sm || 0, 0, 0);
      e.setHours(eh, em || 0, 0, 0);
    }
    return { start: s.toISOString(), end: e.toISOString() };
  }

  async function onSave() {
    setErr(null); setBusy(true);
    const { start: s, end: e } = buildRange();
    const res = await fetch(`/api/pt/folgas/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: title.trim() || 'Folga', start: s, end: e }),
    });
    setBusy(false);
    if (!res.ok) { setErr(await res.text()); return; }
    setOpen(false);
    location.reload();
  }

  return (
    <>
      <button className="btn chip" onClick={() => setOpen(true)}>✏️ Editar</button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Editar folga"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.25)',
            display: 'grid', placeItems: 'center', zIndex: 1000
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="card"
            style={{ width: 'min(520px,92vw)', padding: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Editar folga</h3>
            <div style={{ display: 'grid', gap: 8 }}>
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

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn chip" onClick={() => setOpen(false)}>Fechar</button>
                <button className="btn primary" onClick={onSave} disabled={busy}>
                  {busy ? 'A guardar…' : 'Guardar alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
