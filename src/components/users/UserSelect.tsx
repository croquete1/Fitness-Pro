'use client';

import { useEffect, useState } from 'react';

type Props = {
  label?: string;
  role?: 'ADMIN' | 'TRAINER' | 'CLIENT';
  value?: string;
  onChange: (id?: string) => void;
  placeholder?: string;
};

export default function UserSelect({ label, role, value, onChange, placeholder }: Props) {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = q.trim();
    if (s.length < 2) { setOpts([]); return; }
    let abort = false;
    const run = async () => {
      try {
        const res = await fetch(`/api/users/search?role=${encodeURIComponent(role || '')}&q=${encodeURIComponent(s)}`);
        const j = await res.json();
        if (!abort) setOpts(j.users || []);
      } catch {
        if (!abort) setOpts([]);
      }
    };
    const t = setTimeout(run, 200);
    return () => { abort = true; clearTimeout(t); };
  }, [q, role]);

  return (
    <div className="grid gap-1">
      {label && <label className="text-sm opacity-75">{label}</label>}
      <div className="relative">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          placeholder={placeholder || 'Pesquisar…'}
          className="input"
          style={{ width: '100%', height: 38, border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', background: 'var(--btn-bg)', color: 'var(--text)' }}
        />
        {open && opts.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border bg-[var(--card-bg)] shadow">
            {opts.map((u) => (
              <button
                key={u.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-[var(--hover)]"
                onClick={() => { onChange(u.id); setQ(u.name || u.email || u.id); setOpen(false); }}
              >
                <div className="font-medium">{u.name || '—'}</div>
                <div className="text-xs opacity-70">{u.email}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {value && (
        <div className="text-xs opacity-70">Selecionado: <code>{value}</code></div>
      )}
    </div>
  );
}
