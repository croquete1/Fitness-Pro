// src/app/(app)/dashboard/pt/settings/locations/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';

async function getLocations() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/pt/locations`, { cache: 'no-store' });
  if (!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function LocationsPage() {
  const { items } = await getLocations();

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Locais</h1>

      <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
        <h3 style={{ margin: 0 }}>Novo local</h3>
        <LocationForm />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Os meus locais</h3>
        {items.length === 0 ? (
          <div className="text-muted small">Ainda não registaste locais.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Deslocação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((l: any) => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{l.name}</td>
                  <td style={{ padding: 8 }}>{typeof l.travel_min === 'number' ? `${l.travel_min} min` : '—'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <button
                      className="btn chip"
                      onClick={async () => {
                        if (!confirm('Apagar este local?')) return;
                        await fetch(`/api/pt/locations/${l.id}`, { method: 'DELETE' });
                        location.reload();
                      }}
                    >
                      🗑️ Apagar
                    </button>
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

// --- Client form
'use client';
function LocationForm() {
  const [name, setName] = React.useState('');
  const [travel, setTravel] = React.useState<number>(10);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const res = await fetch('/api/pt/locations', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({ name: name.trim(), travel_min: travel }),
    });
    setBusy(false);
    if (!res.ok) { setErr(await res.text()); return; }
    location.reload();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'end' }}>
      <div>
        <label className="small text-muted">Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="small text-muted">Deslocação típica (min)</label>
        <input type="number" value={travel} min={0} onChange={(e) => setTravel(Number(e.target.value))} />
      </div>
      <button type="submit" className="btn primary" disabled={busy || !name.trim()}>{busy ? 'A guardar…' : 'Adicionar'}</button>
      {!!err && <div className="badge-danger" role="alert" style={{ gridColumn: '1 / -1' }}>{err}</div>}
    </form>
  );
}
