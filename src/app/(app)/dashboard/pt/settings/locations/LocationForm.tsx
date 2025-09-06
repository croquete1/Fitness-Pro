// src/app/(app)/dashboard/pt/settings/locations/LocationForm.tsx
'use client';

import * as React from 'react';

export default function LocationForm() {
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
      <button type="submit" className="btn primary" disabled={busy || !name.trim()}>
        {busy ? 'A guardar…' : 'Adicionar'}
      </button>
      {!!err && <div className="badge-danger" role="alert" style={{ gridColumn: '1 / -1' }}>{err}</div>}
    </form>
  );
}
