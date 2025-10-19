'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';

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

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

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
    }, 320);

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
    <div className="neo-input-group__field neo-combobox" ref={wrapRef}>
      <span className="neo-input-group__label">{label}</span>
      <div
        className="neo-combobox__control"
        data-open={open && !disabled ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <span className="neo-combobox__icon" aria-hidden>
          <Search size={16} strokeWidth={2} />
        </span>
        <input
          className="neo-input neo-input--with-leadingIcon neo-combobox__input"
          placeholder={placeholder}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          disabled={disabled}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && !disabled}
          aria-controls={listId}
        />
        <div className="neo-combobox__actions" aria-hidden={disabled}>
          {loading && (
            <span className="neo-combobox__spinner" aria-hidden>
              <Loader2 size={16} className="neo-combobox__spinnerIcon" />
            </span>
          )}
          {!!value && !disabled && (
            <button
              type="button"
              className="neo-icon-button"
              onClick={clearSelection}
              aria-label="Limpar seleção"
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {open && !disabled && (
        <div
          id={listId}
          role="listbox"
          className="neo-combobox__popover"
          onMouseDown={(event) => event.preventDefault()}
        >
          {items.length === 0 ? (
            <div className="neo-combobox__empty">Sem resultados…</div>
          ) : (
            items.map((it) => (
              <button
                key={it.id}
                role="option"
                aria-selected="false"
                type="button"
                className="neo-combobox__option"
                onClick={() => selectItem(it)}
              >
                <span className="neo-combobox__optionTitle">{it.name ?? '—'}</span>
                <span className="neo-combobox__optionSubtitle">{it.email ?? it.id}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
