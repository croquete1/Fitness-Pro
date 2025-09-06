// src/app/(app)/dashboard/pt/sessions/ui/SchedulerClient.tsx
'use client';

import * as React from 'react';
import WeekCalendar from './WeekCalendar';

type WeekItem = { id: string; start: string; end: string; title?: string };
type Block   = { id?: string; start: string; end: string; title?: string };

type Meta = {
  clients: { id: string; name?: string | null; email: string }[];
  locations: { id: string; name: string; travel_min?: number | null }[];
  defaultBuffer: number;
};

export default function SchedulerClient({
  weekStartIso, sessions, blocks = [],
}: {
  weekStartIso: string;
  sessions: WeekItem[];
  blocks?: Block[];
}) {
  const [meta, setMeta] = React.useState<Meta>({ clients: [], locations: [], defaultBuffer: 10 });
  const [anchor, setAnchor] = React.useState<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = React.useState<null | { startIso: string; durationMin: number }>(null);

  const [clientId, setClientId] = React.useState('');
  const [locationId, setLocationId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState<null | 'checking' | 'saving'>(null);
  const [error, setError] = React.useState<string | null>(null);

  // meta (clientes + locais)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetch('/api/pt/scheduler/meta', { cache: 'no-store' });
      if (!mounted) return;
      if (res.ok) setMeta(await res.json());
    })();
    return () => { mounted = false; };
  }, []);

  const openMenu = React.useCallback((p: { startIso: string; durationMin: number; anchor: { x: number; y: number } }) => {
    setDraft({ startIso: p.startIso, durationMin: p.durationMin });
    setAnchor(p.anchor);
    setError(null);
    setBusy(null);
  }, []);

  const closeMenu = React.useCallback(() => {
    setDraft(null); setAnchor(null); setError(null); setBusy(null);
    setClientId(''); setLocationId(null); setNotes('');
  }, []);

  const selectedLocationName = React.useMemo(
    () => meta.locations.find(l => l.id === locationId)?.name ?? null,
    [meta.locations, locationId]
  );

  const check = React.useCallback(async () => {
    if (!draft) return { ok: false, msg: 'Sem seleção' };
    setBusy('checking'); setError(null);
    const url = new URL('/api/pt/sessions/check', window.location.origin);
    url.searchParams.set('start', draft.startIso);
    url.searchParams.set('dur', String(draft.durationMin));
    url.searchParams.set('buffer', String(meta.defaultBuffer));
    if (selectedLocationName) url.searchParams.set('loc', selectedLocationName);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    setBusy(null);

    if (!res.ok) return { ok: false, msg: data?.error ?? 'Erro ao validar' };
    if (data?.conflict) {
      const t = data?.conflicts?.[0]?.type;
      const msg =
        t === 'overlap' ? 'Já tens uma sessão nesse intervalo.' :
        t === 'buffer' ? `Respeita o intervalo mínimo (${data?.bufferMin} min).` :
        t === 'block'  ? 'Estás indisponível nesse período.' :
        'Conflito com outro evento.';
      return { ok: false, msg };
    }
    return { ok: true };
  }, [draft, meta.defaultBuffer, selectedLocationName]);

  const save = React.useCallback(async () => {
    if (!draft) return;
    if (!clientId) { setError('Escolhe o cliente.'); return; }

    const checkRes = await check();
    if (!checkRes.ok) { setError(checkRes.msg); return; }

    setBusy('saving'); setError(null);
    const res = await fetch('/api/pt/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        start: draft.startIso,
        duration_min: draft.durationMin,
        location: selectedLocationName ?? null,
        notes,
      }),
    });
    setBusy(null);

    if (res.status === 409) { setError(await res.text()); return; }
    if (!res.ok) { setError('Não foi possível criar a sessão.'); return; }

    // sucesso → refresca
    window.location.reload();
  }, [draft, clientId, selectedLocationName, notes, check]);

  return (
    <>
      <WeekCalendar
        weekStartIso={weekStartIso}
        sessions={sessions}
        blocks={blocks}
        bufferMin={meta.defaultBuffer}
        onRequestCreate={(p) => openMenu(p)}
      />

      {/* menu contextual */}
      {draft && anchor && (
        <div
          role="dialog"
          aria-label="Nova sessão"
          style={{
            position: 'fixed', left: anchor.x + 12, top: anchor.y + 12,
            width: 320, maxWidth: '96vw', background: 'var(--card)', color: 'var(--text)',
            border: '1px solid var(--border)', borderRadius: 12,
            boxShadow: '0 18px 60px rgba(0,0,0,.20)', zIndex: 1000, padding: 12,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Nova sessão — {new Date(draft.startIso).toLocaleString('pt-PT')}
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label className="small text-muted">Cliente</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">— escolher —</option>
              {meta.clients.map(c => (
                <option key={c.id} value={c.id}>{c.name ?? c.email}</option>
              ))}
            </select>

            <label className="small text-muted">Local (opcional)</label>
            <select value={locationId ?? ''} onChange={(e) => setLocationId(e.target.value || null)}>
              <option value="">— nenhum —</option>
              {meta.locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}{typeof l.travel_min === 'number' ? ` (+${l.travel_min}m)` : ''}
                </option>
              ))}
            </select>

            <label className="small text-muted">Notas</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />

            {!!error && <div className="badge-danger" role="alert">{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn chip" onClick={closeMenu}>Cancelar</button>
              <button className="btn primary" onClick={save} disabled={busy !== null}>
                {busy === 'saving' ? 'A guardar…' : 'Criar sessão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
