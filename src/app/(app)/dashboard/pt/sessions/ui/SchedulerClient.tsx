// src/app/(app)/dashboard/pt/sessions/ui/SchedulerClient.tsx
'use client';

import React from 'react';

type Client = { id: string; name?: string|null; email: string };

export default function SchedulerClient({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = React.useState(clients[0]?.id ?? '');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [dur, setDur] = React.useState(60);
  const [loc, setLoc] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [conflict, setConflict] = React.useState<{ msg: string; list: { start: string; end: string }[] } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const canSubmit = !!clientId && !!date && !!time && dur > 0 && !checking && !saving && !conflict;

  const startIso = React.useMemo(() => {
    if (!date || !time) return null;
    return new Date(`${date}T${time}:00`).toISOString();
  }, [date, time]);

  async function check() {
    setConflict(null);
    if (!startIso) return;
    setChecking(true);
    const url = `/api/pt/sessions/check?start=${encodeURIComponent(startIso)}&dur=${dur}`;
    const res = await fetch(url, { cache: 'no-store' });
    setChecking(false);
    if (!res.ok) return;
    const data = await res.json();
    if (data?.conflict) {
      setConflict({
        msg: 'Já tens uma sessão neste intervalo. Altera a hora ou duração.',
        list: (data.conflicts ?? []).map((c: any) => ({ start: c.start, end: c.end })),
      });
    }
  }

  React.useEffect(() => { if (startIso) check(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [startIso, dur]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !startIso) return;
    setSaving(true);
    const res = await fetch('/api/pt/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        start: startIso,
        duration_min: dur,
        location: loc || null,
        notes: notes || null,
      }),
    });
    setSaving(false);
    if (res.status === 409) {
      setConflict({
        msg: 'Não foi possível marcar: existe uma sessão sobreposta nesse horário.',
        list: conflict?.list ?? [],
      });
      return;
    }
    if (!res.ok) {
      alert('Erro ao marcar sessão.');
      return;
    }
    // sucesso
    window.location.assign('/dashboard/sessions');
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 12, display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Marcar sessão presencial</h2>
      <div className="text-muted small">Indica um horário — o sistema impede marcações sobrepostas.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>
          <div className="small text-muted">Cliente</div>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div className="small text-muted">Local</div>
          <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Ex.: Ginásio A" />
        </label>

        <label>
          <div className="small text-muted">Data</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label>
          <div className="small text-muted">Hora</div>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>

        <label>
          <div className="small text-muted">Duração (min)</div>
          <input
            type="number"
            min={15}
            step={15}
            value={dur}
            onChange={(e) => setDur(Math.max(15, Number(e.target.value || 0)))}
            required
          />
        </label>

        <label style={{ gridColumn: '1 / -1' }}>
          <div className="small text-muted">Notas</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas para a sessão…" />
        </label>
      </div>

      {checking && <div className="small text-muted">A verificar conflitos…</div>}

      {conflict && (
        <div className="badge-danger" role="alert" style={{ padding: 10, borderRadius: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Não é possível marcar neste horário</div>
          <div className="small">
            {conflict.msg}
            {conflict.list.length > 0 && (
              <ul style={{ margin: '6px 0 0 18px' }}>
                {conflict.list.map((c, i) => (
                  <li key={i}>
                    {new Date(c.start).toLocaleString('pt-PT')} → {new Date(c.end).toLocaleTimeString('pt-PT')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="submit" className="btn primary" disabled={!canSubmit}>
          {saving ? 'A marcar…' : 'Marcar sessão'}
        </button>
      </div>
    </form>
  );
}
