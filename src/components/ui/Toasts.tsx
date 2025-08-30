'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: string; kind: ToastKind; message: string; duration: number };

const listeners = new Set<(t: Omit<Toast, 'id'>) => void>();

export function showToast(input: { kind?: ToastKind; message: string; duration?: number }) {
  const { kind = 'info', message, duration = 3000 } = input;
  for (const l of listeners) l({ kind, message, duration });
}

function ToastsInner() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const onAdd = (t: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = { id, ...t };
      setItems((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, toast.duration);
    };
    listeners.add(onAdd);
    return () => {
      listeners.delete(onAdd);
    };
  }, []);

  const baseCard: React.CSSProperties = {
    display: 'grid',
    gridAutoFlow: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--card-bg)',
    color: 'var(--text)',
    boxShadow: '0 8px 30px rgba(0,0,0,.16)',
  };

  const kindStyles: Record<ToastKind, React.CSSProperties> = {
    info:    { borderColor: 'var(--border)', background: 'var(--btn-bg)' },
    success: { borderColor: 'color-mix(in srgb, var(--success) 45%, var(--border))',
               background: 'color-mix(in srgb, var(--success) 12%, transparent)' },
    error:   { borderColor: 'color-mix(in srgb, var(--danger) 45%, var(--border))',
               background: 'color-mix(in srgb, var(--danger) 12%, transparent)' },
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        display: 'grid',
        gap: 10,
        zIndex: 10_000,
        pointerEvents: 'none',
      }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          style={{ ...baseCard, ...kindStyles[t.kind], pointerEvents: 'auto' }}
        >
          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {t.kind}
          </span>
          <span>{t.message}</span>
          <button
            onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
            className="btn icon"
            aria-label="Fechar"
            title="Fechar"
            style={{ marginLeft: 8 }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Toasts() {
  if (typeof document === 'undefined') return null;
  return createPortal(<ToastsInner />, document.body);
}
