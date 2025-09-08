'use client';

import * as React from 'react';

export default function PTExerciseNote({ exerciseId }: { exerciseId: string }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;
    if (!open) return;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/exercises/notes?exerciseId=${encodeURIComponent(exerciseId)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!ignore) setContent(data?.item?.content ?? '');
      } catch (e: any) {
        if (!ignore) setErr(e.message || 'Falha ao carregar nota.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [exerciseId, open]);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch('/api/exercises/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ exerciseId, content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setOpen(false);
    } catch (e: any) {
      setErr(e.message || 'Falha ao guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <button className="btn chip" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        📝 Minha nota
      </button>
      {open && (
        <div className="card" style={{ padding: 10, position: 'relative', minWidth: 320 }}>
          {loading ? (
            <div className="small text-muted">A carregar…</div>
          ) : (
            <>
              <textarea
                className="auth-input"
                rows={4}
                placeholder="Escreve a tua nota sobre este exercício…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {err && (
                <div className="small" style={{ color: 'var(--danger)', marginTop: 6 }}>
                  {err}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn" onClick={() => setOpen(false)} disabled={saving}>
                  Fechar
                </button>
                <button className="btn primary" onClick={save} disabled={saving}>
                  {saving ? 'A guardar…' : 'Guardar'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
