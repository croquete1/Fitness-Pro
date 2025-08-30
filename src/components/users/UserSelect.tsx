'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Item = { id: string; name?: string | null; email?: string | null };
type Props = {
  label: string;
  role?: 'ADMIN' | 'TRAINER' | 'CLIENT';
  value: Item | null;
  onChange: (v: Item | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function UserSelect({ label, role, value, onChange, placeholder, disabled }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const hint = value ? `${value.name || '—'}${value.email ? ` · ${value.email}` : ''}` : '';

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setItems([]); return; }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const t = setTimeout(async () => {
      const url = `/api/users/search?q=${encodeURIComponent(q)}${role ? `&role=${role}` : ''}`;
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      if (!res.ok) return;
      const { users } = await res.json();
      setItems(users);
      setOpen(true);
    }, 240);

    return () => clearTimeout(t);
  }, [q, role]);

  return (
    <div ref={boxRef} style={{ position: 'relative', display: 'grid', gap: 6 }}>
      <label style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</label>

      {value ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="chip" title={hint}>{hint || 'Selecionado'}</div>
          <button type="button" className="btn chip" onClick={() => onChange(null)}>Trocar</button>
        </div>
      ) : (
        <input
          type="search"
          className="input"
          placeholder={placeholder || 'Procurar por nome/email/telefone…'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.length >= 2 && setOpen(true)}
          disabled={disabled}
        />
      )}

      {open && items.length > 0 && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: 12, marginTop: 6, maxHeight: 260, overflow: 'auto',
          }}
          role="listbox"
        >
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => { onChange(it); setQ(''); setOpen(false); }}
              className="nav-item"
              style={{ width: '100%', textAlign: 'left' }}
            >
              <div style={{ display: 'grid' }}>
                <strong>{it.name || '—'}</strong>
                <span className="text-muted" style={{ fontSize: 12 }}>{it.email || '—'}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && q.length >= 2 && items.length === 0 && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: 12, marginTop: 6, padding: 10, color: 'var(--muted)',
          }}
        >
          Sem resultados.
        </div>
      )}
    </div>
  );
}
