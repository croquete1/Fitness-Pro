// src/app/(app)/dashboard/pt/settings/folgas/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';

async function getFolgas() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/pt/folgas`, { cache: 'no-store' });
  if (!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function FolgasPage() {
  const { items } = await getFolgas();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Folgas</h1>

      <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
        <h3 style={{ margin: 0 }}>Nova folga</h3>
        <FolgaForm />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>As minhas folgas</h3>
        {items.length === 0 ? (
          <div className="text-muted small">Ainda não registaste folgas.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Título</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Início</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Fim</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((b: any) => (
                <tr key={b.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{b.title || 'Folga'}</td>
                  <td style={{ padding: 8 }}>{new Date(b.start_at).toLocaleString('pt-PT')}</td>
                  <td style={{ padding: 8 }}>{new Date(b.end_at).toLocaleString('pt-PT')}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <form action={`/api/pt/folgas/${b.id}`} method="post" onSubmit={(e) => e.preventDefault()}>
                      <button
                        className="btn chip"
                        onClick={async () => {
                          if (!confirm('Apagar esta folga?')) return;
                          await fetch(`/api/pt/folgas/${b.id}`, { method: 'DELETE' });
                          location.reload();
                        }}
                      >
                        🗑️ Apagar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// --- Client form (inline para simplicidade)
'use client';
function FolgaForm() {
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
        <button type="submit" className="btn primary" disabled={busy}>{busy ? 'A guardar…' : 'Adicionar folga'}</button>
      </div>
    </form>
  );
}
