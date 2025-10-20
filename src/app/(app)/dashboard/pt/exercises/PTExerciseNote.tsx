'use client';

import * as React from 'react';
import Button from '@/components/ui/Button';

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
    <div className="pt-exercise-note">
      <Button
        variant="ghost"
        size="sm"
        className="pt-exercise-note__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`pt-exercise-note-${exerciseId}`}
      >
        📝 Minha nota
      </Button>
      {open && (
        <div className="pt-exercise-note__popover" id={`pt-exercise-note-${exerciseId}`} role="dialog" aria-modal="false">
          {loading ? (
            <p className="neo-text--muted">A carregar…</p>
          ) : (
            <>
              <label className="neo-input-group pt-exercise-note__field">
                <span className="neo-input-group__label">Notas pessoais</span>
                <textarea
                  className="neo-input"
                  rows={4}
                  placeholder="Escreve apontamentos técnicos ou adaptações preferidas."
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </label>
              {err ? <p className="pt-exercise-note__error">{err}</p> : null}
              <div className="pt-exercise-note__actions">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={saving}>
                  Fechar
                </Button>
                <Button size="sm" onClick={save} disabled={saving}>
                  {saving ? 'A guardar…' : 'Guardar'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
