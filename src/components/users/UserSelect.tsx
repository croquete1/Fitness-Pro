'use client';

import { useEffect, useMemo, useState } from 'react';

type User = { id: string; name: string | null; email: string | null; role: string; phone?: string | null; };

export default function UserSelect({
  label,
  role,                 // 'TRAINER' | 'CLIENT' | undefined
  value,
  onChange,
  placeholder = 'Procurar por nome, email ou telefone…',
}: {
  label?: string;
  role?: 'TRAINER' | 'CLIENT';
  value?: string | null;
  onChange: (id: string | null, user?: User) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [opts, setOpts] = useState<User[]>([]);
  const [open, setOpen] = useState(false);

  const qs = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let abort = false;
    const run = async () => {
      if (qs.length < 2) { setOpts([]); return; }
      setLoading(true);
      try {
        const url = `/api/users/search?q=${encodeURIComponent(qs)}${role ? `&role=${role}` : ''}`;
        const res = await fetch(url);
        const j = await res.json();
        if (!abort) setOpts(j.users ?? []);
      } catch {
        if (!abort) setOpts([]);
      } finally {
        if (!abort) setLoading(false);
      }
    };
    const t = setTimeout(run, 250);
    return () => { abort = true; clearTimeout(t); };
  }, [qs, role]);

  return (
    <div style={{ position: 'relative' }}>
      {label ? <label style={{ display: 'block', marginBottom: 6 }}>{label}</label> : null}
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input"
        style={{ height: 38, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)', width: '100%' }}
      />
      {open && (qs.length >= 2) && (
        <div
          role="listbox"
          className="card"
          style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, maxHeight: 300, overflow: 'auto', padding: 6 }}
        >
          {loading ? (
            <div className="text-muted" style={{ padding: 8 }}>A procurar…</div>
          ) : opts.length === 0 ? (
            <div className="text-muted" style={{ padding: 8 }}>Sem resultados</div>
          ) : (
            opts.map((u) => (
              <button
                key={u.id}
                type="button"
                className="nav-item"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => { onChange(u.id, u); setQ(u.name || u.email || u.id); setOpen(false); }}
              >
                <div className="nav-label" style={{ fontWeight: 600 }}>{u.name ?? '—'}</div>
                <div className="text-muted" style={{ marginLeft: 6 }}>{u.email ?? '—'}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
