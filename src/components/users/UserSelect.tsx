'use client';

import React, { useEffect, useId, useRef, useState } from 'react';

type UserLite = { id: string; name?: string | null; email?: string | null };

type Props = {
  label: string;
  role: 'TRAINER' | 'CLIENT';
  value: UserLite | null;
  onChange: (v: UserLite | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function UserSelect({
  label,
  role,
  value,
  onChange,
  placeholder = 'Pesquisar…',
  disabled = false,
}: Props) {
  const [q, setQ] = useState<string>(value?.name || value?.email || '');
  const [items, setItems] = useState<UserLite[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  // fecha dropdown ao clicar fora
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // pesquisa debounced
  useEffect(() => {
    if (disabled) return;

    if ((value?.name && q === value.name) || (value?.email && q === value.email)) {
      setItems([]);
      setOpen(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const res = await fetch(
          `/api/users/search?role=${encodeURIComponent(role)}&q=${encodeURIComponent(term)}`,
          { cache: 'no-store', signal: ctrl.signal }
        );
        const data = (await res.json()) as UserLite[] | { error?: string };
        if (!res.ok) throw new Error((data as any)?.error || 'Falha na pesquisa');

        const arr = Array.isArray(data) ? data : [];
        setItems(arr);
        setOpen(arr.length > 0);
      } catch {
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [q, role, value, disabled]);

  function selectItem(u: UserLite) {
    onChange(u);
    setQ(u.name || u.email || u.id);
    setOpen(false);
  }

  function clearSelection() {
    onChange(null);
    setQ('');
    setItems([]);
    setOpen(false);
  }

  return (
    <div className="grid gap-1" ref={wrapRef} style={{ position: 'relative' }}>
      <label className="text-xs opacity-70">{label}</label>

      {/* Campo */}
      <div className="relative">
        <input
          className="h-10 w-full rounded-lg border px-3 pr-20"
          style={{ background: 'var(--btn-bg)', borderColor: 'var(--border)' }}
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          disabled={disabled}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
        />
        {/* Ações à direita do input */}
        <div
          style={{ position: 'absolute', right: 6, top: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {loading && <span className="text-xs opacity-70">a procurar…</span>}
          {!!value && !disabled && (
            <button
              type="button"
              className="btn icon"
              title="Limpar seleção"
              aria-label="Limpar seleção"
              onClick={clearSelection}
            >
              ✖
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-20 w-full overflow-auto rounded-xl border bg-[var(--card-bg)] shadow-lg"
          style={{ borderColor: 'var(--border)', top: '100%', marginTop: 6, maxHeight: 280 }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {items.length === 0 ? (
            <div className="p-3 text-sm opacity-70">Sem resultados…</div>
          ) : (
            items.map((it) => (
              <button
                key={it.id}
                role="option"
                aria-selected="false"
                className="w-full px-3 py-2 text-left hover:bg-[var(--hover)]"
                onClick={() => selectItem(it)}
              >
                <div className="text-sm font-medium">{it.name ?? '—'}</div>
                <div className="text-xs opacity-70">{it.email ?? it.id}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
