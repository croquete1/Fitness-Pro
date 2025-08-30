'use client';

import React, { useEffect, useState } from 'react';

/** Tipos de toast suportados */
export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  /** ms (default 3200) */
  duration?: number;
};

type Listener = (item: ToastItem) => void;

const listeners = new Set<Listener>();

/** API global para disparar toasts a partir de QUALQUER componente client */
export function showToast(
  input: Omit<ToastItem, 'id'> & { id?: string }
) {
  const item: ToastItem = {
    id: input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind: input.kind ?? 'info',
    message: input.message,
    duration: input.duration ?? 3200,
  };
  for (const l of listeners) l(item);
}

/** Contêiner visual que renderiza os toasts — montar APENAS uma vez */
export function Toasts() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onAdd: Listener = (toast) => {
      setItems((prev) => [...prev, toast]);
      // auto-dismiss
      const t = setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== toast.id));
      }, toast.duration ?? 3200);
      // limpar timeout no unmount
      return () => clearTimeout(t);
    };

    listeners.add(onAdd);
    return () => {
      listeners.delete(onAdd);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-[99999] grid gap-2 w-[min(92vw,380px)]"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className="rounded-xl border px-3 py-2 shadow-lg"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
          }}
          role="status"
        >
          <div
            className="text-sm font-medium"
            style={{ color: `var(--text)` }}
          >
            {t.kind === 'success' && '✅ '}
            {t.kind === 'error' && '⛔ '}
            {t.kind === 'info' && 'ℹ️ '}
            {t.kind === 'warning' && '⚠️ '}
            {t.message}
          </div>
        </div>
      ))}
    </div>
  );
}
